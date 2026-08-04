const base = "https://mo7medfc.github.io/ahmed-el-deriny";
const res = await fetch(`${base}/ar/products/stands-roll-up-100-banner/`);
const html = await res.text();
const chunks = new Set(
  [...html.matchAll(/\/ahmed-el-deriny\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0])
);

let found = null;
for (const chunk of chunks) {
  const body = await fetch(`https://mo7medfc.github.io${chunk}`).then((r) => r.text()).catch(() => "");
  if (body.includes("ahmed-deriny.vercel.app")) found = chunk;
}

console.log("page status:", res.status);
console.log("chunks scanned:", chunks.size);
console.log("api base wired:", found || "NOT FOUND");
