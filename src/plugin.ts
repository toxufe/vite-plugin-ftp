import { Plugin, ResolvedConfig, normalizePath } from 'vite';
import path from 'path';
import type { ftpOptions } from './types';
import ftpDeploy from 'ftp-deploy';

export function vitePluginFtp(userConfig: ftpOptions = {}): Plugin {
    let outDir = 'dist';
    const options: ftpOptions = {
        host: '',
        port: 21,
        localRoot: outDir,
        remoteDir: '',
        user: 'root',
        password: '',
        include: ['*', '**/*'],
        exclude: [
            "dist/**/*.map",
            "node_modules/**",
            "node_modules/**/.*",
            ".git/**",
        ],
        deleteRemote: false,
        forcePasv: true,
        sftp: false,
        waitingTime: 2000
    };
    Object.assign(options, userConfig);
    if (Object.keys(options).some(key => !(options as any)[key])) {
        console.log('Error: invalid config, please check carefully');
        process.exit(1);
    }
    return {
        name: 'vite-plugin-ftp',
        apply: 'build',
        enforce: 'post',
        configResolved(config: ResolvedConfig) {
            outDir = config.build.outDir;
        },
        async closeBundle() {
            const ora = await import('ora').then(res => res.default);
            const chalk = await import('chalk').then(res => res.default);
            const spinner = ora();
            const ftp = new ftpDeploy();
            try {
                options.localRoot = path.resolve(normalizePath(outDir));
                ftp.on('uploading', function (data: any) {
                    const { totalFilesCount, transferredFileCount, filename } = data;
                    spinner.start(
                        `uploading ${transferredFileCount}/${totalFilesCount} ${filename}`
                    );
                });
                console.log(chalk.cyan(`✨ begin upload ${options.remoteDir}`));
                // delay config, in timeout case, if connection failed, set it longer
                await new Promise(resolve =>
                    setTimeout(() => {
                        resolve(true);
                    }, options.waitingTime)
                );
                await ftp
                    .deploy({
                        host: options.host,
                        port: options.port,
                        user: options.user,
                        password: options.password,
                        localRoot: options.localRoot,
                        remoteRoot: options.remoteDir,
                        include: options.include,
                        exclude: options.exclude,
                        deleteRemote: options.deleteRemote,
                        forcePasv: options.forcePasv,
                        sftp: options.sftp
                    })
                    .then(() => spinner.succeed(`upload complete`))
                    .catch((err: any) => {
                        console.log(err);
                        spinner.info('upload fail');
                        // all error should interrupt process initiativly, let jenkins like software confirm failure
                        process.exit(1);
                    });
            } catch (error) {
                spinner.fail(
                    `${chalk.yellow('Client connect fail, Please check config carefully')}`
                );
                process.exit(1);
            } finally {
                return;
            }
        }
    };
}
