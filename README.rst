************************************
A simple real-time chat with Node.js
************************************

Purpose
=======

It's a simple real-time chat built with Node.js, just for training.
This project is for the most part largely inspired by this tutorial: https://blog.bini.io/developper-une-application-avec-socket-io/
Warm thanks to its author !

Requirements
============

* `Node JS >= 6.0.0 <https://nodejs.org/en/>`_
* `npm >= 3.8.6 <https://nodejs.org/en/>`_

If you're on Mac OS X, you can easily install install Node.js and npm with `Homebrew <https://brew.sh/>`_ on your machine using:

.. code-block:: shell

  brew install node

Setup
=====

.. code-block:: shell

  npm install
  node app.js

Then, note your host name, open your favorite browser with one (or more) tab(s) and use following URL: ``<YOUR_HOST_NAME>:3000``.

That's it!

Wish list
=========

When I have time for it, below are some improvements that could be crazy:

* Use ent.encode to avoir JavaScript code injection
* Write commentaries in English :) I'm so lazy
* Allow users to upload their own avatar
* Allow users to send images
* Add signup/login with mdp connection
* Store messages in a database