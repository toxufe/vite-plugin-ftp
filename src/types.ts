export interface ftpOptions {
    /**
     * local dist output
     */
    localRoot?: string;
    /**
     * ftp target host address
     */
    host?: string;
    /**
     * ftp target host service port
     */
    port?: number;

    /**
     * ftp username
     */
    user?: string;
    /**
     * ftp password
     */
    password?: string;
    /**
     * upload file include
     */
    include?: string[];
    /**
     * upload file exclude
     */
    exclude?: string[];
    /**
     * ftp target dir
     */
    remoteDir?: string;
    /**
     * time waiting for success connection
     */
    waitingTime?: number;
    /**
     * delete remote file
     */
    deleteRemote?: boolean;
    /**
     * ftp passive mode
     */
    forcePasv?: boolean;
    /**
     * / use sftp or ftp
     */
    sftp?: boolean;
}
