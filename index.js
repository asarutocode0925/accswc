(function (exports) {
  "use strict";

  const { findByProps, findByStoreName } = vendetta.metro;
  const { React, ReactNative: RN, FluxDispatcher } = vendetta.metro.common;
  const { Forms } = vendetta.ui.components;
  const { showToast } = vendetta.ui.toasts;
  const { showConfirmationAlert } = vendetta.ui.alerts;
  const { storage } = vendetta.plugin;
  const { useProxy } = vendetta.storage;
  const { FormSection, FormRow, FormDivider } = Forms;

  storage.accounts ??= [];

  function getCurrent() {
    const token = findByProps("getToken")?.getToken?.();
    const user = findByStoreName("UserStore")?.getCurrentUser?.();
    if (!token || !user) return null;
    return { id: user.id, name: user.username, token };
  }

  function saveCurrent() {
    const cur = getCurrent();
    if (!cur) return showToast("取得失敗: トークン/ユーザーが見つからない");
    const i = storage.accounts.findIndex((a) => a.id === cur.id);
    if (i >= 0) storage.accounts[i] = cur;
    else storage.accounts.push(cur);
    showToast(`保存: ${cur.name}`);
  }

  function switchTo(acc) {
    if (getCurrent()?.id === acc.id) return showToast("すでにこのアカウント");
    try {
      const mod = findByProps("loginToken");
      if (mod?.loginToken) mod.loginToken(acc.token);
      else FluxDispatcher.dispatch({ type: "LOGIN_SUCCESS", token: acc.token });
      showToast(`切替: ${acc.name}`);
    } catch (e) {
      console.error("[AccountSwitcher] switch failed:", e?.message ?? e);
      showToast("切替失敗（ログ参照）");
    }
  }

  function confirmSwitch(acc) {
    showConfirmationAlert({
      title: "アカウント切替",
      content: `${acc.name} に切り替える？`,
      confirmText: "切替",
      cancelText: "キャンセル",
      onConfirm: () => switchTo(acc),
    });
  }

  function confirmRemove(acc) {
    showConfirmationAlert({
      title: "削除",
      content: `${acc.name} を一覧から削除する？`,
      confirmText: "削除",
      cancelText: "キャンセル",
      confirmColor: "red",
      onConfirm: () => {
        storage.accounts = storage.accounts.filter((a) => a.id !== acc.id);
      },
    });
  }

  function Settings() {
    useProxy(storage);
    return React.createElement(
      RN.ScrollView,
      null,
      React.createElement(
        FormSection,
        { title: "操作" },
        React.createElement(FormRow, {
          label: "現在のアカウントを保存",
          onPress: saveCurrent,
        })
      ),
      React.createElement(
        FormSection,
        { title: "保存済み（タップで切替 / 長押しで削除）" },
        storage.accounts.map((acc, i) =>
          React.createElement(
            RN.Pressable,
            { key: acc.id, onLongPress: () => confirmRemove(acc) },
            React.createElement(FormRow, {
              label: acc.name,
              subLabel: acc.id,
              onPress: () => confirmSwitch(acc),
            }),
            i < storage.accounts.length - 1 && React.createElement(FormDivider)
          )
        )
      )
    );
  }

  exports.default = { settings: Settings };
  return exports;
})({});
