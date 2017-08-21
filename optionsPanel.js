/*
 * Copyright (c) 2017 Abdul Al-Hasany. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/* jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/* global define, $, brackets, window */

/* This extension assist users preview and modifey colors inside brackets in CSS, less and scss files */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules.
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Prefs = PreferencesManager.getExtensionPrefs("colorspp_pref"),
        COMMAND_NAME = 'ColorsPP.Options', // package-style naming to avoid collisions;
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        stateManager = PreferencesManager.stateManager.getPrefixedSystem("colorspp_pref");

        Prefs.definePreference("optionsValues", "string", "");
        ExtensionUtils.loadStyleSheet(module, "options-panel.css");

    var ColorsPP_OptionsPanel = {
        // This contains default values
        optionsValues: {},
        savedOptionsValues: JSON.parse(Prefs.get("optionsValues")),
        templateHtml: "",
        init: function () {

            // Load template
            var template = require("text!options_panel.html");
            var templateVars = {
                files: ["all", "CSS", "less", "SCSS"],
                highlight: ["none", "underline", "background", "circle", "square", "gutter"],
                parts: [{
                    "name": "colors"
                }, {
                    "name": "variables"
                }, {
                    "name": "functions"
                }],
                sections: [{
                    "name": "Color Picker"
                    }, {
                    "name": "Document Colors"
                    }, {
                    "name": "Document Color Variables"
                    }, {
                    "name": "Color Combinations"
                    }, {
                    "name": "Function Variants"
                    }],
                "processedVar": function () {
                    return this.name.toLowerCase().replace(/ /ig, "-");
                }
            };


            // Render html Template 
            var html = Mustache.render(template, templateVars);
            ColorsPP_OptionsPanel.templateHtml = $(html);
            ColorsPP_OptionsPanel.form = ColorsPP_OptionsPanel.templateHtml.find("form");


            var value;
            ColorsPP_OptionsPanel.form.find(":input").change(element => {
                ColorsPP_OptionsPanel.form.submit();
            });


            // Loop through saved options and populate values that have been saved (whether itmes are checked or not)
            $.each(ColorsPP_OptionsPanel.savedOptionsValues, element => {
                // If we have an object (array) loop through it and set checked to true
                // Otherwise set the element to true
                var options = ColorsPP_OptionsPanel.savedOptionsValues;

                if (typeof options[element] == "object") {
                    $.each(options[element], e => {
                        var dataValue = options[element][e];
                        for (var valueText in dataValue) {

                            ColorsPP_OptionsPanel.form.find("#" + valueText).prop("checked", true);
                        }
                    });
                } else {
                    var dataValue = options[element];
                    ColorsPP_OptionsPanel.form.find("[name='" + element + "'][data-value='" + dataValue + "']").prop("checked", true);
                }
            });

            var checkboxArr = [];

            ColorsPP_OptionsPanel.form.on("submit", function () {
                // Unset current options
                ColorsPP_OptionsPanel.optionsValues = {};

                // Get all radio elements and add to array
                jQuery(this).find("input:checked").each((index, element) => {
                    var name = $(element).attr("name");
                    var value = $(element).attr("data-value");
                    var id = $(element).attr("id");

                    if (name.indexOf("[]") > -1) {
                        var arrayName = name.replace("[]", "");

                        if (typeof ColorsPP_OptionsPanel.optionsValues[arrayName] == 'undefined')
                            ColorsPP_OptionsPanel.optionsValues[arrayName] = [];

                        // We dont a value for this array but we keep so keys will replace alrady
                        // existing ones and we end up with one uniqe element for each one
                        ColorsPP_OptionsPanel.optionsValues[arrayName].push({
                            [id]: value
                        });
                    } else {
                        ColorsPP_OptionsPanel.optionsValues[name] = value;
                    }
                });

                Prefs.set("optionsValues", JSON.stringify(ColorsPP_OptionsPanel.optionsValues));
                ColorsPP_OptionsPanel.refersh();
                
                return false;
            });


            // Add rendred options panel template to object var
            ColorsPP_OptionsPanel.panel = WorkspaceManager.createBottomPanel(COMMAND_NAME, ColorsPP_OptionsPanel.templateHtml);
            ColorsPP_OptionsPanel.panel.show();

            // Close on click
            ColorsPP_OptionsPanel.templateHtml.on("click", ".options-panel-close", function () {
                //ColorsPP_OptionsPanel.panel.hide();
                ColorsPP_OptionsPanel.templateHtml.addClass("hide");
            });

            

            // Handle Menus and commands 
            ColorsPP_OptionsPanel.handleCommands();
        },
        refersh: function(){
            ColorsPP_OptionsPanel.savedOptionsValues = JSON.parse(Prefs.get("optionsValues"));
        },
        findPref: function (findKey) {
            var found = false;

            // Loop through settings
            for (const key of Object.keys(ColorsPP_OptionsPanel.savedOptionsValues)) {

                // Is it an object or just a pair
                if (typeof ColorsPP_OptionsPanel.savedOptionsValues[key] == "object") {

                    // Loop through the nested object
                    for (const nestedObj of ColorsPP_OptionsPanel.savedOptionsValues[key]) {
                        // Loop through the nested object
                        for (var keys in nestedObj) {
                            if (keys == findKey) {
                                found = nestedObj[keys];
                                break;
                            }
                        }
                    }
                } else {
                    if (key == findKey) {
                        found = ColorsPP_OptionsPanel.savedOptionsValues[key];
                        break;
                    }
                }
            }

            return found;
        },
        handleCommands: function () {
            CommandManager.register("Colors++ Options", COMMAND_NAME, ColorsPP_OptionsPanel.showOptionsPanel);

            // Create a menu item bound to the command
            var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
            menu.addMenuDivider('before', COMMAND_NAME);
            menu.addMenuItem(COMMAND_NAME, {
                "key": "F11"
            });


        },
        showOptionsPanel: function () {
            if (ColorsPP_OptionsPanel.templateHtml.hasClass("hide"))
                ColorsPP_OptionsPanel.templateHtml.removeClass("hide");
            else
                ColorsPP_OptionsPanel.templateHtml.addClass("hide");
        }
    }

    exports.init = ColorsPP_OptionsPanel.init;
    exports.pref = ColorsPP_OptionsPanel;
    exports.prefObj = Prefs;
    exports.findPref = ColorsPP_OptionsPanel.findPref;
});
