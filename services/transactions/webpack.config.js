module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      '@grpc/grpc-js': 'commonjs2 @grpc/grpc-js',
      '@grpc/proto-loader': 'commonjs2 @grpc/proto-loader',
      'kafkajs': 'commonjs2 kafkajs',
      'mqtt': 'commonjs2 mqtt',
      'nats': 'commonjs2 nats',
      'ioredis': 'commonjs2 ioredis',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@grpc/grpc-js',
            '@grpc/proto-loader',
            'kafkajs',
            'mqtt',
            'nats',
            'ioredis',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};

// Made with Bob
