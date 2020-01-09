# Craft 3 Scripts Environment
#
# Local environmental config for nystudio107 Craft scripts
#
# @author    nystudio107
# @copyright Copyright (c) 2017 nystudio107
# @link      https://nystudio107.com/
# @package   craft-scripts
# @since     1.2.4
# @license   MIT
#
# This file should be renamed to '.env.sh' and it should reside in the
# `scripts` directory.  Add '.env.sh' to your .gitignore.

# -- Parse main Craft .env settings where we can
read_var() {
    VAR=$(grep $1 $2 | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]}
}

# -- GLOBAL settings --
# What to prefix the database table names with
GLOBAL_DB_TABLE_PREFIX=""

# The path of the `craft` folder, relative to the root path; paths should always have a trailing /
GLOBAL_CRAFT_PATH="./"

# The maximum age of db backups in days; backups older than this will be automatically removed
GLOBAL_DB_BACKUPS_MAX_AGE=90

# The database driver for this Craft install ('mysql' or 'pgsql')
GLOBAL_DB_DRIVER="mysql"

# -- LOCAL settings --

# Local path constants; paths should always have a trailing /
LOCAL_ROOT_PATH=$(read_var BASE_PATH .env)
LOCAL_ASSETS_PATH=${LOCAL_ROOT_PATH}"public_html/uploads/"

# Local user & group that should own the Craft CMS install
LOCAL_CHOWN_USER="admin"
LOCAL_CHOWN_GROUP="apache"

# Local directories relative to LOCAL_ROOT_PATH that should be writeable by the $CHOWN_GROUP
LOCAL_WRITEABLE_DIRS=(
                "${GLOBAL_CRAFT_PATH}storage"
                "public_html/cpresources"
                "public_html/assets"
                )

# Local asset directories relative to LOCAL_ASSETS_PATH that should be synched with remote assets
LOCAL_ASSETS_DIRS=(
                ""
                )

# Craft-specific file directories relative to GLOBAL_CRAFT_PATH that should be synched with remote files
LOCAL_CRAFT_FILE_DIRS=(
                "rebrand"
                )

# Absolute paths to directories to back up, in addition to `LOCAL_ASSETS_DIRS` and `LOCAL_CRAFT_FILE_DIRS`
LOCAL_DIRS_TO_BACKUP=(
                )

# Local FastCGI Cache path; leave it empty ("") if you're not using FastCGI Cache; paths should always have a trailing /
# The `clear_caches.sh` script will delete everything in this directory when it is executed (say, on deploy)
LOCAL_FASTCGI_CACHE_DIR=""

# Local Redis database ID; leave it empty ("") if you're not using Redis. The `clear_caches.sh` script will purge
# this Redis database when it is executed (say, on deploy)
LOCAL_REDIS_DB_ID=""

# Local Redis password; leave it empty ("") if no password is required. You'll probably only need this if you've set a
# password for Redis yourself. It's disabled by default on Redis installations.
LOCAL_REDIS_PASSWORD=""

# Local database constants; default port for mysql is 3306, default port for postgres is 5432
LOCAL_DB_NAME=$(read_var DB_DATABASE .env)
LOCAL_DB_PASSWORD="UPDATE_ME"
LOCAL_DB_USER=$(read_var DB_USER .env)
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="3306"

# If you are using mysql 5.6.10 or later and you have `login-path` setup as per:
# https://opensourcedbms.com/dbms/passwordless-authentication-using-mysql_config_editor-with-mysql-5-6/
# you can use it instead of the above LOCAL_DB_* constants; otherwise leave this blank
LOCAL_DB_LOGIN_PATH=""

# The `mysql` and `mysqldump` commands to run locally
LOCAL_MYSQL_CMD="mysql"
LOCAL_MYSQLDUMP_CMD="mysqldump"

# The `psql` and `pg_dump` commands to run locally
LOCAL_PSQL_CMD="psql"
LOCAL_PG_DUMP_CMD="pg_dump"

# Local backups path; paths should always have a trailing /
LOCAL_BACKUPS_PATH="/home/forge/hamiltonengine.com/backups/"

# -- REMOTE settings --

# Remote Amazon S3 bucket name
REMOTE_S3_BUCKET="REPLACE_ME"

# Optional subfolder relative to the S3 bucket root; paths should always have a trailing /
REMOTE_S3_PATH=""

