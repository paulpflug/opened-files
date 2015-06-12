treeManager = null
log = require("./log")("tree-manager")
module.exports =
new class TreeManager
  treeViewElement: null
  openedFilesElement: null
  disposables: null
  constructor: ->
    return treeManager if treeManager?
    @treeViewElement = document.querySelector "div.tree-view-scroller"
    window.addEventListener "resize", @resize
    return @
  setOpenedFilesElement: (element) =>
    @openedFilesElement = element

  autoHeight: =>
    log "resizing"
    unless @openedFilesElement?
      @treeViewElement.setAttribute "style", "height: 100%"
      return
    @openedFilesElement.removeAttribute "style"
    containerHeight = @treeViewElement.parentElement.clientHeight
    ofHeight = @openedFilesElement.scrollHeight
    tvHeight = containerHeight - ofHeight
    if tvHeight < containerHeight/2
      log "half/half resizing"
      tvHeight = containerHeight/2
      @openedFilesElement.setAttribute "style", "height: #{tvHeight}px"
    @treeViewElement.setAttribute "style", "height: #{tvHeight}px"
    @resizeRunning = false

  resizeRunning: false
  resize: =>
    unless @resizeRunning
      @resizeRunning = true
      if window.requestAnimationFrame
        window.requestAnimationFrame @autoHeight
      else
        setTimeout @autoHeight, 66

  destroy: =>
    @treeViewElement.removeAttribute "style"
    window.removeEventListener "resize", @resize
