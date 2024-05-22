// const srcs = ["wpp.js", "wa-js.js", "content.js"];

// console.log("Injecting scripts...");
// for (const src of srcs) {
//     const script = document.createElement("script");
//     script.src = chrome.runtime.getURL(src);
//     document.head.appendChild(script);
// }

// const timer = setInterval(() => {
//     if (document.getElementById("side")) {
//         clearInterval(timer);
//         window.dispatchEvent(new CustomEvent("initWpp"));
//         window.dispatchEvent(new CustomEvent("loadWpp"));
//     }
// }, 1000);