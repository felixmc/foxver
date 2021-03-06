const assign = require('assign-deep')
const vasync = require('vasync')
const fs = require('fs')
const rereaddir = require('recursive-readdir')
const path = require('path')

function loadDir (dir, options = {}) {
  options = assign({
    filter: {
      ignore: [],
      ext: ['.js'],
    },
    whitelist: [],
    recursive: false,
  }, options)

  if (options.whitelist.length) {
    return loadModules(dir, options, options.whitelist)
  } else {
    const readdir = options.recursive ? rereaddir : fs.readdir

    return new Promise((resolve, reject) => {
      readdir(dir, (err, files) => {
        if (err) reject(err)
        else {
          loadModules(dir, options, files)
            .then(resolve, reject)
        }
      })
    })
  }
}

function loadModules (dir, options, files) {
  return new Promise((resolve, reject) => {
    const modules = options.whitelist.length ? options.whitelist : filterFiles(files, options.filter)

    if (modules.length) {
      vasync.forEachPipeline({
        inputs: modules.map(filename => ({ dir: dir, filename: filename })),
        func: loadModule,
      }, (err, results) => {
        if (err) reject(err)
        else resolve(results.successes)
      })
    } else {
      resolve([])
    }
  })
}

function filterFiles (files, filter) {
  return files.filter(filename => {
    const ext = path.extname(filename)
    return filter.ext.indexOf(ext) !== -1 && filter.ignore.indexOf(filename) === -1
  })
}

function loadModule (options, fileCallback) {
  let err = null
  let result = null
  try {
    const module = require(path.resolve(options.dir, options.filename))
    const name = options.filename.split('.')[0].replace(options.dir + '/', '')
    result = { name, filename: options.filename, module }
  } catch (e) {
    err = e
  } finally {
    fileCallback(err, result)
  }
}

module.exports = { loadModule, loadModules, loadDir }
