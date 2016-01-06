# Roadmap Public Website

Please read the [Contributing](CONTRIBUTING.md) document for details on how to publish content to the site using [Prose.io](https://prose.io).

## Table of Contents

1. [Quickstart](#quickstart)
1. [Requirements](#requirements)
1. [Workflow](#workflow)

## Quickstart

This quickstart assumes you’ve already installed all [requirements](#requirements).

```bash
git clone git@github.com:getroadmap/roadmap-site.git
cd roadmap-site
bundle install
npm install
bower install
npm start
visit [http://localhost:9000](http://localhost:9000) 
```

## Requirements

### [Ruby](https://ruby-lang.org) and its tooling

Jekyll runs on Ruby. [Install for Windows](http://rubyinstaller.org/downloads/). Macs have ruby pre-installed, but you may want to sandbox your development versions of Ruby using [rbenv](http://rbenv.org) or [rvm](https://rvm.io)

Once you’ve installed ruby, use the `gem` command line tool to install [bundler](https://bundler.io).

The `--no-rdoc --no-ri` flags exclude documentation from download, to speed things up.

```bash
gem install --no-rdoc -no-ri bundler
```

Navigate to the project folder, and use bundler to install gem dependencies.

```bash
bundle install
```

### [Node](https://nodejs.org/en/download/)

Node powers the command line build tools that the website uses.

Once you’ve installed Node, we need to install some global node tools using Node’s package manager, `npm`.

#### Global Packages

- [Gulp](https://gulpjs.com)
- [BrowserSync](https://browsersync.io)
- [Bower](https://bower.io)

```bash
npm install -g gulp browsersync bower
```

#### Project Packages

Navigate to the project folder and use npm to install dev dependencies, and bower to install front-end dependencies.

NPM installs the packages saved in the [package.json file](https://github.com/getroadmap/roadmap-site/blob/master/package.json). Bower installs dependencies defined in the [bower.json file](https://github.com/getroadmap/roadmap-site/blob/master/bower.json).

```bash
npm install
bower install
```

### Workflow

Once you’ve installed all dependencies, run `npm start` to kickoff the gulp task runner, which renders the pages using jekyll, builds styles, scripts, and images, serves everything on a localhost port, and watches for changes across your files.

Once you’re ready to publish changes for review, run::smile:

```bash
gulp build:gh-pages
```

This creates a `dist` folder with your rendered files.

#### Publishing to github pages

I use Github pages as a staging ground for reviewing changes.

The site makes use of [Travis CI](https://travis-ci.org) to build and “test” the `develop` branch the site.

To preview the site on Github pages, merge your branch into `develop`, and push that branch back to github. In about 5-15 minutes, [https://getroadmap.github.io/roadmap-site/](https://getroadmap.github.io/roadmap-site/) will update with your changes.

##### Manual Publishing to Github Pages.

You can publish the site to Github Pages yourself by running the following commands (assuming a mac).

```bash
gulp build:gh-pages
cd gh-pages
git init
git remote add origin git@github.com:getroadmap/roadmap-site.git
git add ./
git commit -m 'my commit message'
git push -fu origin HEAD:gh-pages
```

#### Publishing Live

The site makes use of [Travis CI](https://travis-ci.org) to build and “test” the production version of the site.

To publish the site, merge your development branch into `master`, and push those changes back to github. In about 5-15 minutes, the site will update with your changes.

##### Manual Publishing

You can deploy manually using the following steps

```bash
gulp build:gh-pages
cd dist/
git init
git remote add origin git@github.com:getroadmap/roadmap-site.git
git add ./
git commit -m 'my commit message'
git push -fu origin HEAD:gh-pages
```
