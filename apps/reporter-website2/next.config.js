//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  images: {
    domains: ['speedskatingbc.ca'],
  },
  experimental: {
    appDir: true,
  },
  redirects: async () => {
    return [
      {
        source: '/',
        basePath: false,
        destination: '/event/2/program',
        permanent: false,
      },
    ];
  }
};

module.exports = withNx(nextConfig);
