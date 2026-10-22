const fs = require("fs"), assert = require("assert");
const src = fs.readFileSync("index.js", "utf8");
const calls = { toast: [], confirm: [], dispatch: [] };
let token = "TOKEN_A", user = { id: "1", username: "alice" };
const mk = (t) => (p, ...c) => ({ t, p, c });
const vendetta = {
  metro: {
    findByProps: (k) => k === "getToken" ? { getToken: () => token } : k === "loginToken" ? undefined : undefined,
    findByStoreName: () => ({ getCurrentUser: () => user }),
    common: { React: { createElement: (t, p, ...c) => ({ t, p, c }) }, ReactNative: { ScrollView: "SV", Pressable: "PR" },
      FluxDispatcher: { dispatch: (e) => calls.dispatch.push(e) } },
  },
  ui: { components: { Forms: { FormSection: "FS", FormRow: "FR", FormDivider: "FD" } },
    toasts: { showToast: (m) => calls.toast.push(m) },
    alerts: { showConfirmationAlert: (o) => calls.confirm.push(o) } },
  plugin: { storage: {} }, storage: { useProxy: () => {} },
};
// Vendetta方式のローダと同じ評価形式
const plugin = new Function("vendetta", `return ${src}`)(vendetta);
assert.strictEqual(typeof plugin.default.settings, "function");
const s = vendetta.plugin.storage;
const find = (n, k) => { if (!n || typeof n !== "object") return null; if (Array.isArray(n)) { for (const x of n) { const r = find(x, k); if (r) return r; } return null; } if (n.p?.[k]) return n; for (const c of [].concat(n.c ?? [])) { const r = find(c, k); if (r) return r; } return null; };
let tree = plugin.default.settings();
find(tree, "onPress").p.onPress();                    // 保存
assert.deepStrictEqual(s.accounts, [{ id: "1", name: "alice", token: "TOKEN_A" }]);
find(tree, "onPress").p.onPress();                    // 同一アカウント再保存: 重複しない
assert.strictEqual(s.accounts.length, 1);
user = { id: "2", username: "bob" }; token = "TOKEN_B";
find(tree, "onPress").p.onPress();
assert.strictEqual(s.accounts.length, 2);
tree = plugin.default.settings();
user = { id: "1", username: "alice" }; token = "TOKEN_A";
const pr = find(tree, "onLongPress");
const switchRow = pr.c[0];                            // 1件目
user = { id: "2", username: "bob" }; token = "TOKEN_B";
switchRow.p.onPress();
calls.confirm.pop().onConfirm();                      // bobで1(alice)へ切替
assert.deepStrictEqual(calls.dispatch.pop(), { type: "LOGIN_SUCCESS", token: "TOKEN_A" });
user = { id: "1", username: "alice" }; token = "TOKEN_A";
switchRow.p.onPress(); calls.confirm.pop().onConfirm();
assert.strictEqual(calls.dispatch.length, 0);
pr.p.onLongPress(); calls.confirm.pop().onConfirm(); // 削除
assert.strictEqual(s.accounts.length, 1);
console.log("OK: 保存/重複/切替/同一スキップ/削除", calls.toast);
