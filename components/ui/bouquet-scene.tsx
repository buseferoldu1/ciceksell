"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FLOWER_OPTIONS, WRAP_OPTIONS } from "@/lib/bouquet";

/**
 * Buketin canli 3D onizlemesi.
 *
 * model-viewer tek seferde TEK model gosterebildigi icin burada three.js
 * (react-three-fiber) kullaniliyor: cicekler + vazo/kutu/ambalaj ayni
 * sahnede birlestirilebiliyor.
 *
 * Performans:
 *  - Her cicek turunun GLB'si BIR kez indirilir; dallar clone ile cogaltilir
 *    (geometri/doku paylasilir).
 *  - Ekranda en fazla MAX_GORUNUR dal cizilir (fazlasi fiyata dahildir ama
 *    sahneyi bogmaz).
 *  - Bolum gorunur degilken render dondurulur (frameloop="demand" + invalidate).
 *
 * Yerlesim mantigi:
 *  Tum dallarin sap baslangici (bagli noktasi) TEK bir pivot noktasinda
 *  birlesir; her dal sadece farkli bir yone (aci) ve farkli bir egimle
 *  (tilt) o pivottan disari dogru acilir. Turler ic ice (round-robin)
 *  siralanir ki ayni renk merkezde yigilip digerleri disari itilmesin.
 *  Yayilma yaricapi toplam dal sayisina gore olceklenir: az dalda kompakt,
 *  cok dalda daha dolgun bir buket olusur; kraft/luks sarma da bu yayilima
 *  gore dinamik boyutlanir, boylece hicbir zaman gereksiz genis durmaz.
 */

const MAX_GORUNUR = 28;

/**
 * Yerlesim/olcek hesaplarinda (yayilma yaricapi, sarma boyutu, egim
 * tavani) kullanilan referans cicek yuksekligi — tipik bir gul boyu.
 */
const CICEK_REFERANS_YUKSEKLIK = 0.5;

/**
 * normalizeCicek icindeki hacimsel (kupkok) olcegin hedefi. Bu deger
 * CICEK_REFERANS_YUKSEKLIK ile AYNI ANLAMA gelmez: kupkok olcek, max
 * boyuta gore olcekten kucuk cikar, o yuzden benzer nihai yukseklige
 * ulasmak icin daha kucuk bir sayi kullanilir (bkz. normalizeCicek).
 */
const CICEK_HACIM_HEDEFI = 0.218;

/**
 * Bazi kaynak modeller kendi ekseninde yatik/donuk geldigi icin (orn.
 * sakayik modeli asil uzun ekseni Z boyunca) buket icinde dik durmalari
 * icin duzeltme rotasyonu uygulanir.
 */
const MODEL_DUZELTME: Record<string, [number, number, number]> = {
  "/models/buket/sakayik.glb": [-Math.PI / 2, 0, 0],
};

/** Konteyner (vazo/kutu) icin: sadece Y yuksekligine gore olceklendirip merkezler */
function normalizeYukseklik(obj: THREE.Object3D, hedefYukseklik: number) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const olcek = size.y > 0 ? hedefYukseklik / size.y : 1;
  obj.scale.setScalar(olcek);

  const box2 = new THREE.Box3().setFromObject(obj);
  const merkez = new THREE.Vector3();
  box2.getCenter(merkez);
  obj.position.x -= merkez.x;
  obj.position.z -= merkez.z;
  obj.position.y -= box2.min.y;
  return obj;
}

/**
 * Cicekler icin: once (gerekirse) dogrultma rotasyonu uygulanir, sonra
 * HACIMSEL boyuta (x*y*z kupkoku) gore olceklendirilir. Kaynak modeller
 * (Sketchfab) birbirinden tamamen farkli, keyfi birim olceklerinde
 * geldigi icin sadece Y yuksekligine ya da tek bir en buyuk boyuta gore
 * olceklemek, yuvarlak/genis modellerin (orn. acilmis gul, ortanca)
 * digerlerinden hala belirgin buyuk gorunmesine yol aciyordu. Kupkok
 * (geometrik ortalama) olcegi, modelin sekli ne olursa olsun ayni
 * "hacimsel" izlenimi verecek sekilde her turu ayni hedefe getirir.
 */
function normalizeCicek(obj: THREE.Object3D, hedefBoyut: number, url: string) {
  const duzeltme = MODEL_DUZELTME[url];
  if (duzeltme) obj.rotation.set(...duzeltme);

  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const hacimselBoyut = Math.cbrt(Math.max(size.x, 1e-6) * Math.max(size.y, 1e-6) * Math.max(size.z, 1e-6));
  const olcek = hacimselBoyut > 0 ? hedefBoyut / hacimselBoyut : 1;
  obj.scale.setScalar(olcek);

  const box2 = new THREE.Box3().setFromObject(obj);
  const merkez = new THREE.Vector3();
  box2.getCenter(merkez);
  obj.position.x -= merkez.x;
  obj.position.z -= merkez.z;
  obj.position.y -= box2.min.y;
  return obj;
}

function Cicek({
  url,
  position,
  rotationY,
  tilt,
}: {
  url: string;
  position: [number, number, number];
  rotationY: number;
  tilt: number;
}) {
  const { scene } = useGLTF(url);
  const klon = useMemo(() => {
    const c = scene.clone(true);
    normalizeCicek(c, CICEK_HACIM_HEDEFI, url);
    return c;
  }, [scene, url]);

  return (
    <group position={position} rotation={[tilt, rotationY, 0]}>
      <primitive object={klon} />
    </group>
  );
}

function Kap({ url, hedefYukseklik }: { url: string; hedefYukseklik: number }) {
  const { scene } = useGLTF(url);
  const klon = useMemo(() => {
    const c = scene.clone(true);
    normalizeYukseklik(c, hedefYukseklik);
    return c;
  }, [scene, hedefYukseklik]);
  return <primitive object={klon} />;
}

/**
 * Kirisik/kagit gorunumlu buket sarma yuzeyi: tabanda (bagli nokta) tek
 * noktaya kapanan, yukari dogru dallarin yayilimina uyarak acilan, ust
 * kenari duzensiz/yirtik bir koni. Gercek bir koni gibi degil, elde
 * sarilmis kagit gibi durmasi icin kenarlar ve yaricap acisal olarak
 * dalgalandirilir.
 */
function kagitSarmaGeometry(yukseklik: number, ustYaricap: number, segman = 48) {
  const geo = new THREE.BufferGeometry();
  const pozisyonlar: number[] = [0, 0, 0]; // 0: bagli nokta (taban)

  for (let i = 0; i <= segman; i++) {
    const aci = (i / segman) * Math.PI * 2;
    const kirisik = 1 + 0.07 * Math.sin(aci * 7 + 0.6) + 0.035 * Math.sin(aci * 13 + 1.4);
    const r = ustYaricap * kirisik;
    const yirtik = yukseklik + 0.045 * Math.sin(aci * 5 + 1.1) + 0.02 * Math.sin(aci * 11);
    pozisyonlar.push(Math.cos(aci) * r, yirtik, Math.sin(aci) * r);
  }

  const indeksler: number[] = [];
  for (let i = 0; i < segman; i++) {
    const a = 0;
    const b = 1 + i;
    const c = 1 + i + 1;
    indeksler.push(a, c, b);
  }

  geo.setIndex(indeksler);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pozisyonlar, 3));
  geo.computeVertexNormals();
  return geo;
}

function KagitSarma({ renk, yukseklik, ustYaricap }: { renk: string; yukseklik: number; ustYaricap: number }) {
  const geo = useMemo(() => kagitSarmaGeometry(yukseklik, ustYaricap), [yukseklik, ustYaricap]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={renk}
        side={THREE.DoubleSide}
        roughness={0.85}
        metalness={0.02}
      />
    </mesh>
  );
}

/** Konteyner turune gore dallarin bagli noktasi, taban egimi ve mutlak yaricap tavani */
function yerlesimAyarlari(kapId: string) {
  switch (kapId) {
    case "vazo":
      // Vazonun agzinin hemen altindan baslar; sap ucu vazo icinde gizli
      // kalir, tomurcuklar agizdan yukari tasar. Vazonun dar agzindan
      // tasmasin diye yaricap sikica sinirlanir.
      return { pivotY: 0.32, tiltBase: 0.26, jitter: 0.02, maxRadius: 0.115 };
    case "kutu":
      // Kutunun agzinin hemen altindan baslar; kutunun kenarindan tasmasin
      return { pivotY: 0.24, tiltBase: 0.22, jitter: 0.018, maxRadius: 0.17 };
    default:
      // Kraft/luks kagit sarma: serbest, dogal yelpaze acilimi
      return { pivotY: 0.07, tiltBase: 0.5, jitter: 0.014, maxRadius: 0.34 };
  }
}

/**
 * Dal sayisina gore yayilma olceği: az dalda kompakt, cok dalda daha
 * dolgun bir buket. 0.55 - 1.1 arasinda katsayi doner.
 */
function sayiOlcegi(toplamDal: number) {
  const olcek = 0.55 + Math.sqrt(Math.min(toplamDal, 12) / 12) * 0.55;
  return Math.min(1.1, olcek);
}

/** Sahne icerigi — dallari buket seklinde yerlestirir */
function Sahne({
  stems,
  wrapId,
}: {
  stems: Record<string, number>;
  wrapId: string;
}) {
  const grupRef = useRef<THREE.Group>(null);

  // Yavas donme
  useFrame((_, delta) => {
    if (grupRef.current) grupRef.current.rotation.y += delta * 0.15;
  });

  // Dallari tur ic ice (round-robin) siralanmis duz listeye ac.
  // Boylece ayni renk merkeze yigilip diger renkler disari itilmez;
  // her tur genel yayilima esit oranda dagilir.
  const dallar = useMemo(() => {
    const gruplar = Object.entries(stems)
      .map(([id, adet]) => ({ f: FLOWER_OPTIONS.find((x) => x.id === id), adet }))
      .filter((g): g is { f: NonNullable<typeof g.f>; adet: number } => !!g.f?.model && g.adet > 0);

    const liste: { url: string; id: string }[] = [];
    const kalan = gruplar.map((g) => g.adet);
    let toplamKalan = kalan.reduce((a, b) => a + b, 0);
    let k = 0;
    let guvenlik = 0;
    while (toplamKalan > 0 && liste.length < MAX_GORUNUR && guvenlik < 10000) {
      guvenlik++;
      if (kalan[k] > 0) {
        const g = gruplar[k];
        const kullanilan = g.adet - kalan[k];
        liste.push({ url: g.f.model, id: `${g.f.id}-${kullanilan}` });
        kalan[k]--;
        toplamKalan--;
      }
      k = (k + 1) % gruplar.length;
    }
    return liste;
  }, [stems]);

  const toplamDal = useMemo(
    () => Object.values(stems).reduce((s, n) => s + n, 0),
    [stems]
  );

  const kap = WRAP_OPTIONS.find((w) => w.id === wrapId) ?? WRAP_OPTIONS[0];
  const vazoda = kap.id === "vazo";
  const kutuda = kap.id === "kutu";
  const { pivotY, tiltBase, jitter, maxRadius } = yerlesimAyarlari(kap.id);

  // Dal sayisina gore yayilma olcegi + konteynerin agzina gore mutlak tavan
  const olcek = sayiOlcegi(toplamDal);
  const efektifTiltMax = Math.min(tiltBase * olcek, Math.atan2(maxRadius, CICEK_REFERANS_YUKSEKLIK * 0.9));

  // Kraft/luks sarma boyutu, gercek yayilmaya gore dinamik hesaplanir ki
  // az dalda gereksiz genis durmasin
  const yayilmaYaricap = CICEK_REFERANS_YUKSEKLIK * Math.sin(efektifTiltMax);
  const sarmaUstYaricap = Math.max(0.13, yayilmaYaricap + 0.055);
  const sarmaYukseklik = Math.max(0.22, pivotY + CICEK_REFERANS_YUKSEKLIK * 0.42);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} />

      <group ref={grupRef}>
        {/* Kap */}
        {vazoda && <Kap url="/models/buket/vazo.glb" hedefYukseklik={0.46} />}
        {kutuda && <Kap url="/models/buket/hediye-kutusu.glb" hedefYukseklik={0.4} />}
        {!vazoda && !kutuda && (
          <KagitSarma
            renk={kap.id === "luks" ? "#f6b6be" : "#c9b8a3"}
            yukseklik={sarmaYukseklik}
            ustYaricap={sarmaUstYaricap}
          />
        )}

        {/* Cicekler: hepsinin sap baslangici ayni pivot noktasinda birlesir,
            altin acili yonlerde disari dogru farkli egimlerle acilir. */}
        {dallar.map((d, i) => {
          const t = dallar.length <= 1 ? 0 : i / (dallar.length - 1);
          const aci = i * 2.399963; // altin aci -> dengeli sag/sol dagilim
          const tilt = 0.07 + Math.sqrt(t) * (efektifTiltMax - 0.07);
          // Bagli noktada hafif titresim: tam ust uste binmesin
          const jx = Math.cos(aci) * jitter;
          const jz = Math.sin(aci) * jitter;
          return (
            <Suspense key={d.id} fallback={null}>
              <Cicek
                url={d.url}
                position={[jx, pivotY, jz]}
                rotationY={aci}
                tilt={tilt}
              />
            </Suspense>
          );
        })}
      </group>

      <Environment preset="apartment" />
    </>
  );
}

export default function BouquetScene({
  stems,
  wrapId,
  className = "",
}: {
  stems: Record<string, number>;
  wrapId: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gorunur, setGorunur] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    // WebGL yoksa 3D'yi hic deneme
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) setWebgl(false);
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setGorunur(e.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dalSayisi = Object.values(stems).reduce((s, n) => s + n, 0);

  if (!webgl) return null;

  return (
    <div ref={ref} className={className}>
      {gorunur && (
        <Canvas
          camera={{ position: [0, 0.7, 1.6], fov: 37 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Sahne stems={stems} wrapId={wrapId} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 1.9}
            target={[0, 0.4, 0]}
          />
        </Canvas>
      )}
      {dalSayisi > MAX_GORUNUR && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/70">
          +{dalSayisi - MAX_GORUNUR} dal daha (fiyata dahil)
        </span>
      )}
    </div>
  );
}

// GLB'leri onceden yukle (ilk etkilesim akici olsun)
FLOWER_OPTIONS.forEach((f) => f.model && useGLTF.preload(f.model));
useGLTF.preload("/models/buket/vazo.glb");
useGLTF.preload("/models/buket/hediye-kutusu.glb");
