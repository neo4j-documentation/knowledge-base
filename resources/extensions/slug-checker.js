module.exports.register = function (registry, context) {
  registry.treeProcessor(function () {
    const self = this

    self.process(function (doc) {
      const slug = doc.getAttribute('slug')
      if (slug) {
        if (!slug.match(/^[a-z0-9-]+$/)) {
          throw new Error(`The slug attribute is invalid: '${slug}', it must only contains lowercase alphanumeric characters and hyphens, aborting.`)
        }
      }
      return doc
    })
  })
}
