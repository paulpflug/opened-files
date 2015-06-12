
if atom.inDevMode() && atom.config.get('opened-files.debug')
  module.exports = (nsp) ->
    if nsp?
      nsp = "."+nsp
    else
      nsp = ""
    return (string) ->
      console.log "opened-files#{nsp}: #{string}"
else
  module.exports = ->
    return -> null
