import { ResolvedConfig, normalizePath } from 'vite';
import path from 'path';
import ftpDeploy from 'ftp-deploy';

interface Options {
    localRoot?: string; // local dist output
    host: string;
    port: number;
    user: string;
    password?: string;
    include?: string[]; // file includes
    remoteDir?: string; // target server path
    waitingTime: number; // time waiting for success connection
}

export default function vitePluginFtp(userConfig) {
    let outDir = 'dist';
    const options: Options = {
        host: '',
        port: 21,
        remoteDir: '',
        user: 'root',
        password: '',
        include: ['*', '**/*'],
        waitingTime: 2000
    };
    Object.assign(options, userConfig);
    console.log(options);
    if (Object.keys(options).some(key => !options[key])) {
        console.log('Error: invalid config, please check carefully');
        process.exit(1);
        return;
    }
    return {
        name: 'ftp-upload',
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
                ftp.on('uploading', function (data) {
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
                        include: options.include
                    })
                    .then(() => spinner.succeed(`upload complete`))
                    .catch(err => {
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
