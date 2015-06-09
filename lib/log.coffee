module.exports = (inDevMode) ->
  if inDevMode
    return (string) ->
      console.log "opened-files: #{string}"
  else
    return -> null
