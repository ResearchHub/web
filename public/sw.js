if (!self.define) {
  let e,
    i = {};
  const t = (t, a) => (
    (t = new URL(t + '.js', a).href),
    i[t] ||
      new Promise((i) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = t), (e.onload = i), document.head.appendChild(e);
        } else (e = t), importScripts(t), i();
      }).then(() => {
        let e = i[t];
        if (!e) throw new Error(`Module ${t} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, n) => {
    const r = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (i[r]) return;
    let s = {};
    const c = (e) => t(e, r),
      o = { module: { uri: r }, exports: s, require: c };
    i[r] = Promise.all(a.map((e) => o[e] || c(e))).then((e) => (n(...e), s));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '70982299956984de7e659e37d76022f3' },
        {
          url: '/_next/static/58Tz5oM4f3q8GcSxv4EZA/_buildManifest.js',
          revision: '656b83554cb0695ab417281f35467bfb',
        },
        {
          url: '/_next/static/58Tz5oM4f3q8GcSxv4EZA/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/112-bffce61f37f5b92f.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/25-7be7f07451215154.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/325-8aecdead5a3ac855.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/437-058e840c95e1b327.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        {
          url: '/_next/static/chunks/4bd1b696-2f0b64377080a9dc.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        { url: '/_next/static/chunks/501-cdc9f2ce17fa7b9b.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/517-77a23b6db639adae.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/520-eebcce54cb94890a.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        {
          url: '/_next/static/chunks/54a60aa6-a90e9da6cbeaeba0.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        { url: '/_next/static/chunks/590-e303e0cc32d97a2c.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/669-318b90011e92e874.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        {
          url: '/_next/static/chunks/69b09407-c2adb7b553afe8b2.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/6be7e44c-dffa05919c86a46f.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/70e0d97a-b147deb68b4bba17.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        { url: '/_next/static/chunks/840-fb1596bfcea7901c.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        {
          url: '/_next/static/chunks/870fdd6f-caeddde7f31474b7.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        { url: '/_next/static/chunks/906-c7e2b2a95b7b4797.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        { url: '/_next/static/chunks/979-ab9c81ed4d110f91.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        {
          url: '/_next/static/chunks/ab9ca618-365424b337fd4d26.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-82e42b48218e9b9c.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/author/%5Bid%5D/layout-a4c8ef15b15f7ac6.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/author/%5Bid%5D/page-cd5ed13bae7c4416.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/fund/%5Bid%5D/%5Bslug%5D/page-e46e01631e75ce28.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/grant/%5Bid%5D/%5Bslug%5D/page-c02964a65e789b82.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/layout-c46c2967d2ac9a04.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/learn/page-bbeaa85b0d7e03c0.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/marketplace/page-89eb337d020c1a2a.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/notebook/%5Broom%5D/page-999226c8ed9f56fe.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/notebook/api/ai/route-a9b4548a27a3b364.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/notebook/api/collaboration/route-535c0c777be3ef2c.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/notebook/layout-7b55c1898bab61a8.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/notebook/route-1680b76039c39510.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/page-4dcfe7d785360e97.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/paper/%5Bid%5D/%5Bslug%5D/page-fd13fa0804006a4b.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/researchcoin/layout-7948c368db79e1e9.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/app/researchcoin/page-222cb8d4837823e2.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/c16f53c3-e7247ca93aca2312.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/ca377847-016959ad0b446bd1.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/framework-58f97e80b1d6e3ea.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        { url: '/_next/static/chunks/main-7fb574a6b690089e.js', revision: '58Tz5oM4f3q8GcSxv4EZA' },
        {
          url: '/_next/static/chunks/main-app-a04fdeeacc31d26c.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/pages/_app-abffdcde9d309a0c.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/pages/_error-94b8133dd8229633.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-cc9a7467c5e44f6d.js',
          revision: '58Tz5oM4f3q8GcSxv4EZA',
        },
        { url: '/_next/static/css/5006e678c1b4bf92.css', revision: '5006e678c1b4bf92' },
        { url: '/_next/static/css/6b3cb307639b8902.css', revision: '6b3cb307639b8902' },
        { url: '/_next/static/css/c1e570150590096a.css', revision: 'c1e570150590096a' },
        { url: '/_next/static/css/d30f411d297accae.css', revision: 'd30f411d297accae' },
        {
          url: '/_next/static/media/4473ecc91f70f139-s.p.woff',
          revision: '78e6fc13ea317b55ab0bd6dc4849c110',
        },
        {
          url: '/_next/static/media/463dafcda517f24f-s.p.woff',
          revision: 'cbeb6d2d96eaa268b4b5beb0b46d9632',
        },
        { url: '/_next/static/media/CalSans-SemiBold.162bf645.ttf', revision: '162bf645' },
        { url: '/_next/static/media/CalSans-SemiBold.90475aac.woff2', revision: '90475aac' },
        { url: '/_next/static/media/CalSans-SemiBold.d19ce3e3.woff', revision: 'd19ce3e3' },
        {
          url: '/_next/static/media/inter-cyrillic-100-normal.dc90b237.woff2',
          revision: 'dc90b237',
        },
        {
          url: '/_next/static/media/inter-cyrillic-100-normal.f9eff440.woff',
          revision: 'f9eff440',
        },
        {
          url: '/_next/static/media/inter-cyrillic-200-normal.1ea11c46.woff',
          revision: '1ea11c46',
        },
        {
          url: '/_next/static/media/inter-cyrillic-200-normal.3f3a159e.woff2',
          revision: '3f3a159e',
        },
        {
          url: '/_next/static/media/inter-cyrillic-300-normal.7335a360.woff2',
          revision: '7335a360',
        },
        {
          url: '/_next/static/media/inter-cyrillic-300-normal.edcd2385.woff',
          revision: 'edcd2385',
        },
        {
          url: '/_next/static/media/inter-cyrillic-400-normal.4cc6e28c.woff',
          revision: '4cc6e28c',
        },
        {
          url: '/_next/static/media/inter-cyrillic-400-normal.547767ef.woff2',
          revision: '547767ef',
        },
        {
          url: '/_next/static/media/inter-cyrillic-500-normal.5ec9103b.woff2',
          revision: '5ec9103b',
        },
        {
          url: '/_next/static/media/inter-cyrillic-500-normal.c1b1edeb.woff',
          revision: 'c1b1edeb',
        },
        {
          url: '/_next/static/media/inter-cyrillic-600-normal.8c69e1bb.woff2',
          revision: '8c69e1bb',
        },
        {
          url: '/_next/static/media/inter-cyrillic-600-normal.c0105440.woff',
          revision: 'c0105440',
        },
        {
          url: '/_next/static/media/inter-cyrillic-700-normal.571aeb62.woff',
          revision: '571aeb62',
        },
        {
          url: '/_next/static/media/inter-cyrillic-700-normal.9ce56ec3.woff2',
          revision: '9ce56ec3',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-100-normal.0e1aec1d.woff2',
          revision: '0e1aec1d',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-100-normal.191a6bdc.woff',
          revision: '191a6bdc',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-200-normal.043206d9.woff',
          revision: '043206d9',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-200-normal.43d8878a.woff2',
          revision: '43d8878a',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-300-normal.5df3b45f.woff2',
          revision: '5df3b45f',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-300-normal.be7b9715.woff',
          revision: 'be7b9715',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-400-normal.2440d5f8.woff2',
          revision: '2440d5f8',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-400-normal.6e13bad4.woff',
          revision: '6e13bad4',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-500-normal.656d5a0e.woff',
          revision: '656d5a0e',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-500-normal.d8f535fc.woff2',
          revision: 'd8f535fc',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-600-normal.62fe61a7.woff',
          revision: '62fe61a7',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-600-normal.dd95b020.woff2',
          revision: 'dd95b020',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-700-normal.94d4fa7d.woff2',
          revision: '94d4fa7d',
        },
        {
          url: '/_next/static/media/inter-cyrillic-ext-700-normal.9fa0c048.woff',
          revision: '9fa0c048',
        },
        { url: '/_next/static/media/inter-greek-100-normal.4601ceba.woff2', revision: '4601ceba' },
        { url: '/_next/static/media/inter-greek-100-normal.b849cf34.woff', revision: 'b849cf34' },
        { url: '/_next/static/media/inter-greek-200-normal.299c0a99.woff', revision: '299c0a99' },
        { url: '/_next/static/media/inter-greek-200-normal.d64aa322.woff2', revision: 'd64aa322' },
        { url: '/_next/static/media/inter-greek-300-normal.14123a0c.woff2', revision: '14123a0c' },
        { url: '/_next/static/media/inter-greek-300-normal.ec3d0adc.woff', revision: 'ec3d0adc' },
        { url: '/_next/static/media/inter-greek-400-normal.573bacd1.woff2', revision: '573bacd1' },
        { url: '/_next/static/media/inter-greek-400-normal.d6adbb78.woff', revision: 'd6adbb78' },
        { url: '/_next/static/media/inter-greek-500-normal.947d4ab3.woff2', revision: '947d4ab3' },
        { url: '/_next/static/media/inter-greek-500-normal.af596b86.woff', revision: 'af596b86' },
        { url: '/_next/static/media/inter-greek-600-normal.61c756cf.woff', revision: '61c756cf' },
        { url: '/_next/static/media/inter-greek-600-normal.ee808ffe.woff2', revision: 'ee808ffe' },
        { url: '/_next/static/media/inter-greek-700-normal.384941e3.woff', revision: '384941e3' },
        { url: '/_next/static/media/inter-greek-700-normal.a094cf2b.woff2', revision: 'a094cf2b' },
        {
          url: '/_next/static/media/inter-greek-ext-100-normal.1423dba6.woff',
          revision: '1423dba6',
        },
        {
          url: '/_next/static/media/inter-greek-ext-100-normal.3d999e5e.woff2',
          revision: '3d999e5e',
        },
        {
          url: '/_next/static/media/inter-greek-ext-200-normal.28c1da10.woff',
          revision: '28c1da10',
        },
        {
          url: '/_next/static/media/inter-greek-ext-200-normal.64dcccdd.woff2',
          revision: '64dcccdd',
        },
        {
          url: '/_next/static/media/inter-greek-ext-300-normal.7b467784.woff2',
          revision: '7b467784',
        },
        {
          url: '/_next/static/media/inter-greek-ext-300-normal.fb5ad981.woff',
          revision: 'fb5ad981',
        },
        {
          url: '/_next/static/media/inter-greek-ext-400-normal.f196e968.woff',
          revision: 'f196e968',
        },
        {
          url: '/_next/static/media/inter-greek-ext-400-normal.f8992900.woff2',
          revision: 'f8992900',
        },
        {
          url: '/_next/static/media/inter-greek-ext-500-normal.34eb831d.woff',
          revision: '34eb831d',
        },
        {
          url: '/_next/static/media/inter-greek-ext-500-normal.5fe403a5.woff2',
          revision: '5fe403a5',
        },
        {
          url: '/_next/static/media/inter-greek-ext-600-normal.a46b5cba.woff',
          revision: 'a46b5cba',
        },
        {
          url: '/_next/static/media/inter-greek-ext-600-normal.d05f940f.woff2',
          revision: 'd05f940f',
        },
        {
          url: '/_next/static/media/inter-greek-ext-700-normal.411652e2.woff2',
          revision: '411652e2',
        },
        {
          url: '/_next/static/media/inter-greek-ext-700-normal.fa338c24.woff',
          revision: 'fa338c24',
        },
        { url: '/_next/static/media/inter-latin-100-normal.9da4947b.woff', revision: '9da4947b' },
        { url: '/_next/static/media/inter-latin-100-normal.f52a4b98.woff2', revision: 'f52a4b98' },
        { url: '/_next/static/media/inter-latin-200-normal.2fb5efe4.woff', revision: '2fb5efe4' },
        { url: '/_next/static/media/inter-latin-200-normal.b94fa4a8.woff2', revision: 'b94fa4a8' },
        { url: '/_next/static/media/inter-latin-300-normal.0a506d8e.woff2', revision: '0a506d8e' },
        { url: '/_next/static/media/inter-latin-300-normal.38608292.woff', revision: '38608292' },
        { url: '/_next/static/media/inter-latin-400-normal.360a94a9.woff2', revision: '360a94a9' },
        { url: '/_next/static/media/inter-latin-400-normal.38abad60.woff', revision: '38abad60' },
        { url: '/_next/static/media/inter-latin-500-normal.7986a549.woff', revision: '7986a549' },
        { url: '/_next/static/media/inter-latin-500-normal.e98e390c.woff2', revision: 'e98e390c' },
        { url: '/_next/static/media/inter-latin-600-normal.8ad7b5a9.woff', revision: '8ad7b5a9' },
        { url: '/_next/static/media/inter-latin-600-normal.efad9519.woff2', revision: 'efad9519' },
        { url: '/_next/static/media/inter-latin-700-normal.6b51d3fc.woff2', revision: '6b51d3fc' },
        { url: '/_next/static/media/inter-latin-700-normal.ac2885ce.woff', revision: 'ac2885ce' },
        {
          url: '/_next/static/media/inter-latin-ext-100-normal.6e075b22.woff',
          revision: '6e075b22',
        },
        {
          url: '/_next/static/media/inter-latin-ext-100-normal.c40abd11.woff2',
          revision: 'c40abd11',
        },
        {
          url: '/_next/static/media/inter-latin-ext-200-normal.954373b9.woff',
          revision: '954373b9',
        },
        {
          url: '/_next/static/media/inter-latin-ext-200-normal.ccc0cca6.woff2',
          revision: 'ccc0cca6',
        },
        {
          url: '/_next/static/media/inter-latin-ext-300-normal.3033d32d.woff2',
          revision: '3033d32d',
        },
        {
          url: '/_next/static/media/inter-latin-ext-300-normal.9eef1747.woff',
          revision: '9eef1747',
        },
        {
          url: '/_next/static/media/inter-latin-ext-400-normal.732723e2.woff2',
          revision: '732723e2',
        },
        {
          url: '/_next/static/media/inter-latin-ext-400-normal.d1f6a5a2.woff',
          revision: 'd1f6a5a2',
        },
        {
          url: '/_next/static/media/inter-latin-ext-500-normal.8f855dd9.woff2',
          revision: '8f855dd9',
        },
        {
          url: '/_next/static/media/inter-latin-ext-500-normal.b3be213d.woff',
          revision: 'b3be213d',
        },
        {
          url: '/_next/static/media/inter-latin-ext-600-normal.43dc1cee.woff2',
          revision: '43dc1cee',
        },
        {
          url: '/_next/static/media/inter-latin-ext-600-normal.8756e10d.woff',
          revision: '8756e10d',
        },
        {
          url: '/_next/static/media/inter-latin-ext-700-normal.a2935e03.woff',
          revision: 'a2935e03',
        },
        {
          url: '/_next/static/media/inter-latin-ext-700-normal.e8daf0b5.woff2',
          revision: 'e8daf0b5',
        },
        {
          url: '/_next/static/media/inter-vietnamese-100-normal.03f887b7.woff2',
          revision: '03f887b7',
        },
        {
          url: '/_next/static/media/inter-vietnamese-100-normal.c33529d0.woff',
          revision: 'c33529d0',
        },
        {
          url: '/_next/static/media/inter-vietnamese-200-normal.d1738c75.woff',
          revision: 'd1738c75',
        },
        {
          url: '/_next/static/media/inter-vietnamese-200-normal.d4b1139a.woff2',
          revision: 'd4b1139a',
        },
        {
          url: '/_next/static/media/inter-vietnamese-300-normal.ad9ef503.woff2',
          revision: 'ad9ef503',
        },
        {
          url: '/_next/static/media/inter-vietnamese-300-normal.b4574483.woff',
          revision: 'b4574483',
        },
        {
          url: '/_next/static/media/inter-vietnamese-400-normal.1411920a.woff',
          revision: '1411920a',
        },
        {
          url: '/_next/static/media/inter-vietnamese-400-normal.de4fc44f.woff2',
          revision: 'de4fc44f',
        },
        {
          url: '/_next/static/media/inter-vietnamese-500-normal.7c0a695f.woff2',
          revision: '7c0a695f',
        },
        {
          url: '/_next/static/media/inter-vietnamese-500-normal.c5840ea0.woff',
          revision: 'c5840ea0',
        },
        {
          url: '/_next/static/media/inter-vietnamese-600-normal.8b0a74d0.woff',
          revision: '8b0a74d0',
        },
        {
          url: '/_next/static/media/inter-vietnamese-600-normal.9d518599.woff2',
          revision: '9d518599',
        },
        {
          url: '/_next/static/media/inter-vietnamese-700-normal.26a4f6eb.woff',
          revision: '26a4f6eb',
        },
        {
          url: '/_next/static/media/inter-vietnamese-700-normal.c48feea2.woff2',
          revision: 'c48feea2',
        },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/manifest.json', revision: 'b58d44241b359452f04806f532c5f97e' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: i, event: t, state: a }) =>
              i && 'opaqueredirect' === i.type
                ? new Response(i.body, { status: 200, statusText: 'OK', headers: i.headers })
                : i,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const i = e.pathname;
        return !i.startsWith('/api/auth/') && !!i.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    );
});
