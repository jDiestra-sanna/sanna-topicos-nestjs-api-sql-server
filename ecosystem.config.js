module.exports = {
    apps: [
        {
            name: 'your-app',
            script: 'src/main.js',
            env: {
                DB_HOST: '10.6.16.10',
                DB_USER: 'usr_topicare',
                DB_PASS: '24&Tp:Q^[4x_)RE^]',
                DB_NAME: 'sanna-topicos-mssql',
                DB_PORT: '1433',
                NODE_ENV: 'production',
            },
        },
    ],
};