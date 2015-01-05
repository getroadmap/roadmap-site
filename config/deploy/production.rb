# PRODUCTION-specific deployment configuration
# please put general deployment config in config/deploy.rb


set :rails_env, :production

set :branch, fetch(:branch, "dist")
set :env, fetch(:env, :rails_env)

set :application, 'ppmroadmap.com'
set :domain, 'homeland.ppmroadmap.com'
set :user, 'berried_billheads'
set :port, 1002

set :default_server, domain
set :dest_server, ENV['SERVER'] || default_server

role  :app, dest_server
role  :web, dest_server
role  :db,  dest_server, :primary => true

set :keep_releases, 3

set(:deploy_to) {"/var/www/ppmroadmap.com/#{rails_env}/htdocs"}


after 'deploy:create_symlink', 'app:robots'
after 'deploy:create_symlink', 'app:symlink'
