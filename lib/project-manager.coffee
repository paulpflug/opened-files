fs = require 'fs'

module.exports = new class ProjectManager
  file: (update = false) ->
    @filepath = null if update
    unless @filepath?
      filename = 'projects.cson'
      filedir = atom.getConfigDirPath()
      if atom.config.get('project-manager.environmentSpecificProjects')
        os = require 'os'
        hostname = os.hostname().split('.').shift().toLowerCase()
        filename = "projects.#{hostname}.cson"
      @filepath = "#{filedir}/#{filename}"
    @filepath

  getProject: =>
    @CSON ?= require 'season'
    @projects = @CSON.readFileSync(@file()) || {}
    projectPaths = atom.project.getPaths()
    found = false
    for title, project of @projects
      continue if not project.paths?
      count = 0
      for path in project.paths
        if path in projectPaths
          count++
      if count == projectPaths.length
        found = true
        break
    if found
      return project
    else
      return false
  getProjectSetting: =>
    project = @getProject()
    if project and project.settings and project.settings["opened-files"]
      return project.settings["opened-files"]
    else
      return false

  addToProjectSetting: (settings,notifications = true) =>
    project = @getProject()
    if project
      project.settings ?= {}
      project.settings["opened-files"] ?= {}
      for k,v of settings
        project.settings["opened-files"][k] = v
      @CSON.writeFile @file(), @projects, (err) ->
        if notifications
          unless err
            atom.notifications?.addSuccess "Settings of #{project.title} has been saved"
          else
            atom.notifications?.addError "#{project.title} could not be saved to #{@file()}"
    else if notifications
      atom.notifications?.addError "Current project wasn't found in #{@file()}"
