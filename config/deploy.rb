# Set Stages
set :stages, %w(production)


set :scm, :git
set :repository, 'git@github.com:getroadmap/roadmap-site.git'


# Deploy Details
set :deploy_via, :remote_cache
set :copy_cache, true
set :copy_exclude, ['.git']


# SSH
set :ssh_options, {:forward_agent => true}


#Global Config
default_run_options[:pty] = true
set :keep_releases, 3
set :use_sudo, false


namespace :app  do
  desc 'change permissions'
  task :permissions do
    run "chgrp -R www-data #{current_path}"
    run "find #{current_path} -type d -exec chmod 775 {} +"
    run "find #{current_path} -type f -exec chmod 664 {} +"
  end
end

# after 'deploy:create_symlink', 'app:symlink'
after 'deploy:update', 'deploy:cleanup'
after 'deploy:update', 'app:permissions'


