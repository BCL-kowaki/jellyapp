export default {
  future: {
    webpack5: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // ここで他のカスタム設定を行うことができます。

    return config;
  },
};
