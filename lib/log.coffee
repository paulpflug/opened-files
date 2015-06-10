module.exports = (inDevMode, nsp) ->
  if inDevMode
    if nsp?
      nsp = "."+nsp
    else
      nsp = ""
    return (string) ->
      console.log "opened-files#{nsp}: #{string}"
  else
    return -> null
