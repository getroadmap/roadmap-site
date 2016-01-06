# PRODUCTION-specific deployment configuration
# please put general deployment config in config/deploy.rb


set :rails_env, :production

set :branch, fetch(:branch, "dist")
set :env, fetch(:env, :rails_env)

set :application, 'ppmroadmap.com'
set :domain, '104.130.169.162'
set :user, 'root'
# set :port, 1002

set :default_server, domain
set :dest_server, ENV['SERVER'] || default_server

role  :app, dest_server
role  :web, dest_server
role  :db,  dest_server, :primary => true

set :keep_releases, 3

set(:deploy_to) {"/var/www/ppmroadmap.com/#{rails_env}"}


after 'deploy:update', 'app:permissions'
