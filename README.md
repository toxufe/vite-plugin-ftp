# vite-plugin-ftp
a simple useful vite ftp plugin, based on [ftp-deploy](https://github.com/simonh1000/ftp-deploy), upload your dist file after vite build.

# install
```
> npm i vite-plugin-ftp --save-dev
```

# usage

```js
// vite.config.ts
import vitePluginFtp from 'vite-plugin-ftp'

export default {
  plugins: [
    vitePluginFtp({
      user: "user",
      // Password optional, prompted if none given
      password: "password",
      host: "ftp.someserver.com",
      port: 21,
      localRoot: "dist",
      remoteRoot: "/www/wwwroot",
      // include: ["*", "**/*"],      // this would upload everything except dot files
      include: ["*.php", "dist/*", ".*"],
      // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
      exclude: [
          "dist/**/*.map",
          "node_modules/**",
          "node_modules/**/.*",
          ".git/**",
      ],
      // delete ALL existing files at destination before uploading, if true
      deleteRemote: false,
      // Passive mode is forced (EPSV command is not sent)
      forcePasv: true,
      // use sftp or ftp
      sftp: false,
    })
  ]
}
```