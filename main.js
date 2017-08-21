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

require.config({
    paths: {
        "text" : "lib/text",
        "i18n" : "lib/i18n"
    },
    locale: brackets.getLocale()
});

/* This extension assist users preview and modifey colors inside brackets in CSS, less and scss files */
define(function (require, exports, module) {
    "use strict";

    // Brackets modules.
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        EditorManager = brackets.getModule('editor/EditorManager'),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule("command/Menus"),
        AppInit = brackets.getModule("utils/AppInit"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Mustache = brackets.getModule("thirdparty/mustache/mustache");

    require('./spectrum/spectrum');
    var optionsPanel = require('optionsPanel');

    // Load template
    var colorPicker = require("text!color_picker.html");




    ExtensionUtils.loadStyleSheet(module, "spectrum/spectrum.css");
    ExtensionUtils.loadStyleSheet(module, "main.css");

    var ColorsPP = {
        colors: [],
        variables: [],
        functions: [],
        markers: [],
        documentColors: "",
        documentVariables: "",
        widgetInstance: null,
        widgetLine: -1,
        colorPickerTemplate: "",
        clickedColorObject: {},
        editorObject: {},
        gutterName: "colors-plus-plus-gutter",
        namedColorsNames: ["black", "silver", "darkblue", "gray", "grey", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua", "mediumblue", "darkgreen", "darkcyan", "deepskyblue", "darkturquoise", "mediumspringgreen", "springgreen", "cyan", "midnightblue", "dodgerblue", "lightseagreen", "forestgreen", "seagreen", "darkslategray", "darkslategrey", "limegreen", "mediumseagreen", "turquoise", "royalblue", "steelblue", "darkslateblue", "mediumturquoise", "indigo", "darkolivegreen", "cadetblue", "cornflowerblue", "rebeccapurple", "mediumaquamarine", "dimgray", "dimgrey", "slateblue", "olivedrab", "slategray", "slategrey", "lightslategray", "lightslategrey", "mediumslateblue", "lawngreen", "chartreuse", "aquamarine", "skyblue", "lightskyblue", "blueviolet", "darkred", "darkmagenta", "saddlebrown", "darkseagreen", "lightgreen", "mediumpurple", "darkviolet", "palegreen", "darkorchid", "yellowgreen", "sienna", "brown", "darkgray", "darkgrey", "lightblue", "greenyellow", "paleturquoise", "lightsteelblue", "powderblue", "firebrick", "darkgoldenrod", "mediumorchid", "rosybrown", "darkkhaki", "mediumvioletred", "indianred", "peru", "chocolate", "tan", "lightgray", "lightgrey", "thistle", "orchid", "goldenrod", "palevioletred", "crimson", "gainsboro", "plum", "burlywood", "lightcyan", "lavender", "darksalmon", "violet", "palegoldenrod", "lightcoral", "khaki", "aliceblue", "honeydew", "azure", "sandybrown", "wheat", "beige", "whitesmoke", "mintcream", "ghostwhite", "salmon", "antiquewhite", "linen", "lightgoldenrodyellow", "oldlace", "magenta", "deeppink", "orangered", "tomato", "hotpink", "coral", "darkorange", "lightsalmon", "orange", "lightpink", "pink", "gold", "peachpuff", "navajowhite", "moccasin", "bisque", "mistyrose", "blanchedalmond", "papayawhip", "lavenderblush", "seashell", "cornsilk", "lemonchiffon", "floralwhite", "snow", "lightyellow", "ivory"],
        namedColorsHex: ["#000000", "#C0C0C0", "#00008B", "#808080", "#808080", "#FFFFFF", "#800000", "#FF0000", "#800080", "#FF00FF", "#008000", "#00FF00", "#808000", "#FFFF00", "#000080", "#0000FF", "#008080", "#00FFFF", "#0000CD", "#006400", "#008B8B", "#00BFFF", "#00CED1", "#00FA9A", "#00FF7F", "#00FFFF", "#191970", "#1E90FF", "#20B2AA", "#228B22", "#2E8B57", "#2F4F4F", "#2F4F4F", "#32CD32", "#3CB371", "#40E0D0", "#4169E1", "#4682B4", "#483D8B", "#48D1CC", "#4B0082", "#556B2F", "#5F9EA0", "#6495ED", "#663399", "#66CDAA", "#696969", "#696969", "#6A5ACD", "#6B8E23", "#708090", "#708090", "#778899", "#778899", "#7B68EE", "#7CFC00", "#7FFF00", "#7FFFD4", "#87CEEB", "#87CEFA", "#8A2BE2", "#8B0000", "#8B008B", "#8B4513", "#8FBC8F", "#90EE90", "#9370DB", "#9400D3", "#98FB98", "#9932CC", "#9ACD32", "#A0522D", "#A52A2A", "#A9A9A9", "#A9A9A9", "#ADD8E6", "#ADFF2F", "#AFEEEE", "#B0C4DE", "#B0E0E6", "#B22222", "#B8860B", "#BA55D3", "#BC8F8F", "#BDB76B", "#C71585", "#CD5C5C", "#CD853F", "#D2691E", "#D2B48C", "#D3D3D3", "#D3D3D3", "#D8BFD8", "#DA70D6", "#DAA520", "#DB7093", "#DC143C", "#DCDCDC", "#DDA0DD", "#DEB887", "#E0FFFF", "#E6E6FA", "#E9967A", "#EE82EE", "#EEE8AA", "#F08080", "#F0E68C", "#F0F8FF", "#F0FFF0", "#F0FFFF", "#F4A460", "#F5DEB3", "#F5F5DC", "#F5F5F5", "#F5FFFA", "#F8F8FF", "#FA8072", "#FAEBD7", "#FAF0E6", "#FAFAD2", "#FDF5E6", "#FF00FF", "#FF1493", "#FF4500", "#FF6347", "#FF69B4", "#FF7F50", "#FF8C00", "#FFA07A", "#FFA500", "#FFB6C1", "#FFC0CB", "#FFD700", "#FFDAB9", "#FFDEAD", "#FFE4B5", "#FFE4C4", "#FFE4E1", "#FFEBCD", "#FFEFD5", "#FFF0F5", "#FFF5EE", "#FFF8DC", "#FFFACD", "#FFFAF0", "#FFFAFA", "#FFFFE0", "#FFFFF0"],

        // show color preview
        showColorMarks: function () {
            if (!ColorsPP.editor)
                return;


            // Loop through all lines
            ColorsPP.editor.eachLine(function (line) {

                var i = line.lineNo();
                var lineText = ColorsPP.editor.getLine(i);

                // We get the two sides of the css rule
                var lineTextResults = lineText.indexOf(":");

                if (lineTextResults > -1) {
                    lineTextResults = lineText.split(":");
                    var firstPart = lineTextResults[0];
                    var secondPart = lineTextResults[1];

                    // check first part for any possible varaibles (that contains colors)
                    var findVariables = firstPart.match(/^^\s{0,}(--|@|\$)/ig);
                    if (findVariables != null) {
                        var isColor = ColorsPP.findColors(secondPart, i);
                        if (isColor.result == true) {
                            // Loop through found colors
                            isColor.data.forEach(function (colorMeta) {

                                // Add the varaible to global array
                                ColorsPP.variables.push({
                                    line: i,
                                    var: firstPart.trim(),
                                    color: colorMeta.color,
                                    start: colorMeta.start,
                                    end: colorMeta.end
                                });
                            });
                        }
                    }


                    var findColors = ColorsPP.findColors(lineText, i);
                    if (findColors.result == true) {
                        // Loop through found colors
                        findColors.data.forEach(function (colorMeta) {
                            ColorsPP.colors.push(colorMeta);
                        });
                    }

                    // Find varaibles throughout the docuemnt and color them
                    ColorsPP.highlightVariables(i, lineTextResults);

                    // Find functions throughout the docuemnt and color them
                    ColorsPP.highlightFunctions(i, lineTextResults);

                }

            });


            // Set colors
            ColorsPP.colors.map(colorObj => {
                var options = {
                    start: {
                        line: colorObj.line,
                        ch: colorObj.start
                    },
                    end: {
                        line: colorObj.line,
                        ch: colorObj.end
                    },
                    category: colorObj.category,
                    color: colorObj.color
                };
                ColorsPP.setMarker(options);

            });
        },
        highlightVariables: function (line, string) {
            var firstHalf = string[0].length;
            var secondHalf = string[1];

            // We check if there are any matching varaibales (css, less and sass)
            var match;
            var reg = /(--|@|\$)\b([a-zA-Z0-9\-]+)\b/ig;
            while (match = reg.exec(secondHalf)) {

                var start = match.index + firstHalf + 1;
                var end = start + match[0].length;
                var variable = match[0];

                // get start and end position
                var colorMeta = {
                    start: start,
                    end: end,
                    var: variable,
                    type: 'hex',
                    line: line,
                    category: 'variables'
                };

                var foundVar = ColorsPP.variables.filter(element => {
                    return element.var == variable;
                });


                if (foundVar.length > 0) {
                    // add color value to colorMeta object 
                    colorMeta.color = foundVar[0].color;
                    ColorsPP.colors.push(colorMeta);
                }
            }
        },
        highlightFunctions: function (line, string) {
            // Check if the file is supported (ie, sass or less files because CSS does not use functions)
            if (!ColorsPP.getFileType(['scss', 'less']))
                return true;

            var firstHalf = string[0].length;
            var secondHalf = string[1];

            // We check if there are any matching varaibales (css, less and sass)
            var results;
            var reg = /(darken|lighten|saturate|desaturate|spin|mix|tint|shade|greyscale|grayscale|complement|invert|fade|fadein|fade-in|fadeout|fade-out|opacify|transparentize)\(.*\)/ig;
            while (results = reg.exec(secondHalf)) {

                // +1 is for the ( of the function
                var start = results.index + firstHalf + 1;
                var end = start + results[0].length;
                var functionName = results[1];

                // Get color and the function percentage
                var functionNames = new RegExp(functionName + "|\\)|\\(", "ig");
                var paramaters = results[0].replace(functionNames, "").split(",");
                var pos = {};

                // is there a comma, do we have mutliple paramaters or just one
                switch (paramaters.length) {
                    case 1:
                        var color = secondHalf.substring(secondHalf.indexOf("(") + 1, secondHalf.indexOf(")"));

                        break;

                    case 2:
                        var color = paramaters[0];
                        var colorValue = paramaters[1];
                        var proccessedColorValue = colorValue.replace("%", '').trim();

                        var pos = {
                            paramStart: start + functionName.length + 1,
                            paramEnd: start + functionName.length + 1 + color.length,
                            percentageStart: firstHalf + secondHalf.lastIndexOf(",") + 2,
                            percentageEnd: firstHalf + secondHalf.indexOf(")") + 1
                        };

                    case 3:
                        var color = paramaters[0];
                        var color1 = paramaters[1];
                        var colorValue = paramaters[2];

                        var pos = {
                            paramStart: start + functionName.length + 1,
                            paramEnd: start + functionName.length + 1 + color.length,

                            parmaStart1: this.paramEnd + 1,
                            parmEnd1: start + functionName.length + 1 + color.length + color1.length,

                            percentageStart: firstHalf + secondHalf.lastIndexOf(",") + 2,
                            percentageEnd: firstHalf + secondHalf.indexOf(")") + 1
                        };
                        break;
                }

                // For standard colors (hex, rgba .. etc) just set the value
                var setColor = color;

                // for variables get the variable value
                var colorVarReg = /(--|@|\$)\b([a-zA-Z0-9\-]+)\b/ig;
                if (colorVarReg.test(color)) {
                    // get the original color
                    setColor = ColorsPP.variables.filter(function (colorObj) {
                        return colorObj.var == color;
                    });

                    if (setColor.length > 0)
                        setColor = setColor[0].color;
                    else
                        var setColor = color;

                    // Check for another variable (in case we have mix function)
                    if (color1) {
                        var setColor1 = ColorsPP.variables.filter(function (colorObj) {
                            return colorObj.var == color1;
                        });

                        if (setColor1.length > 0)
                            setColor1 = setColor1[0].color;
                        else
                            var setColor1 = color1;
                    }
                }

                /*
                Remove the varaible from colors array. This is to avoid two occurances in the same line and position.
                Another alternative to conduct this is to use negative lookahead but javascript does not contain this functionlity 
                in its regexp
                */
                // Search in colors arrays to see if there are same lines or charchters
                ColorsPP.colors.map(element => {
                    if ((element.line == line) && (element.start > start && element.start < end))
                        ColorsPP.colors.splice(ColorsPP.colors.indexOf(element), 1);
                });

                var proccessedColor = "";

                // Get final color based on function name
                switch (functionName) {
                    case "darken":
                        proccessedColor = tinycolor(setColor).darken(proccessedColorValue);
                        break;

                    case "lighten":
                        proccessedColor = tinycolor(setColor).lighten(proccessedColorValue);
                        break;

                    case "fadein":
                        var fadein = proccessedColorValue;

                    case "fade-in":
                    case "opacify":
                        if (typeof fadein === "undefined")
                            var fadein = proccessedColorValue * 100;

                        proccessedColor = tinycolor(setColor).fadein(fadein + "%");
                        break;

                    case "fadeout":
                        var fadeout = proccessedColorValue;

                    case "fade-out":
                    case "transparentize":
                        if (typeof fadeout === "undefined")
                            var fadeout = proccessedColorValue * 100;

                        proccessedColor = tinycolor(setColor).fadeout(fadeout + "%");
                        break;

                    case "fade":
                        var alpha = proccessedColorValue / 100;
                        proccessedColor = tinycolor(setColor).setAlpha(alpha);
                        break;

                    case "saturate":
                        proccessedColor = tinycolor(setColor).saturate(proccessedColorValue);
                        break;

                    case "desaturate":
                        proccessedColor = tinycolor(setColor).desaturate(proccessedColorValue);
                        break;

                    case "spin":
                        proccessedColor = tinycolor(setColor).spin(proccessedColorValue);
                        break;

                    case "tint":
                        proccessedColor = tinycolor.mix("#ffffff", setColor, proccessedColorValue);
                        break;

                    case "shade":
                        proccessedColor = tinycolor.mix("#000000", setColor, proccessedColorValue);
                        break;

                    case "grayscale":
                    case "greyscale":
                        proccessedColor = tinycolor(setColor).greyscale();
                        break;

                    case "mix":
                        proccessedColor = tinycolor.mix(setColor, setColor1, proccessedColorValue);
                        break;
                }

                // get start and end position
                var colorMeta = {
                    start: start,
                    end: end,
                    functionName: functionName,
                    full: secondHalf,
                    percentage: colorValue,
                    color: proccessedColor.toString(),
                    initColor: setColor,
                    initColor1: setColor1,
                    line: line,
                    type: 'hex',
                    category: 'functions'
                };

                // Combine the two objects
                var colorMeta = $.extend(colorMeta, pos);

                ColorsPP.colors.push(colorMeta);
                ColorsPP.functions.push(colorMeta);

            }
        },
        clearMarkers: function () {
            if (ColorsPP.markers.length < 0)
                return;

            ColorsPP.markers.map(marker => {
                marker.clear();
            });
        },
        setMarker: function (options) {
            var markerType = optionsPanel.findPref("options-highlight-" + options.category);

            switch (markerType) {
                case "underline":

                    options.style = {
                        css: "border-bottom: 1px solid " + options.color + ";",
                        className: "highlight-underline"
                    };
                    break;

                case "background":
                    var color = tinycolor(options.color).isLight() ? "#000000" : "#ffffff";
                    options.style = {
                        css: "background-color: " + options.color + "; color: " + color + ";",
                        className: "highlight-background"
                    };

                    break;

                case "circle":
                    options.style = {
                        css: "border-color:" + options.color + ";",
                        className: "highlight-circle"
                    };
                    break;

                case "square":
                    options.style = {
                        css: "border-color:" + options.color + ";",
                        className: "highlight-square"
                    };
                    break;

                case "gutter":
                    var gutterOptions = {
                        color: options.color,
                        className: "highlight-gutter",
                        line: options.start.line
                    };

                    ColorsPP.showGutterColor(gutterOptions);
                    break;
            }

            var marker = ColorsPP.editor.markText(options.start, options.end, options.style);
            ColorsPP.markers.push(marker);
        },
        onChanged: function () {
            ColorsPP.colors = [];
            ColorsPP.documentColors = "";
            ColorsPP.documentVariables = "";

            // Clear all markers (if any exists)
            ColorsPP.clearMarkers();

            // Refresh options to get the latest
            optionsPanel.pref.refersh();

            // Get editor
            ColorsPP.activeEditor = EditorManager.getActiveEditor();
            if (ColorsPP.activeEditor) {
                // if the file type is not supported (ie: not needed to have color identification)
                // then dont go on
                if (!ColorsPP.checkEnabledFiles())
                    return true;
                /*
                From brackets API:
                For now, direct access to the underlying CodeMirror
                object is still possible via _codeMirror --
                but this is considered deprecated and may go away.
                */

                ColorsPP.editor = ColorsPP.activeEditor._codeMirror;

                $(ColorsPP.editor).on("change", ColorsPP.onChanged);
                $("#editor-holder").on("mousedown", ".CodeMirror-code > div", ColorsPP.onClicked);

                ColorsPP.initGutter();
                ColorsPP.showColorMarks();
                ColorsPP.prepareColorBox();
            }

        },
        onClicked: function (e) {
            var editor = ColorsPP.editor;

            if (!editor)
                return;

            // Make sure that the clicked element is no the color picker container
            // Clicking on color picker container or its children will add the element again
            if (jQuery(e.target).hasClass('.color-plus-plus') || jQuery(e.target).closest(".color-plus-plus").length > 0)
                return;

            var clickPos = ColorsPP.editor.getCursor();
            var line = clickPos.line;
            var ch = clickPos.ch;

            // Search in colors arrays to see if there are mathcing lines or charchters
            var clickedColorObject = ColorsPP.colors.filter(function (element) {
                return (element.line == line) && (ch > element.start && ch < element.end);
            });

            // Do we have an instnace of widget opened and is the clicked line different to the stored one?
            if (ColorsPP.widgetInstance != null)
                ColorsPP.widgetInstance.clear();

            // dont go further if the clicked char is not a color
            if (clickedColorObject.length < 1) {
                if (ColorsPP.widgetInstance != null)
                    ColorsPP.widgetInstance.clear();

                return true;
            }

            // Get the first matching results of the array
            ColorsPP.clickedColorObject = clickedColorObject[0];

            // add varaiblaes
            var templateVars = {
                documentColors: ColorsPP.documentColors,
                documentVariables: ColorsPP.documentVariables,
                color: ColorsPP.clickedColorObject.color,
                type: ColorsPP.clickedColorObject.type
            };

            // Render the template and et inner html to the template content
            var inner_html = Mustache.render(colorPicker, templateVars);

            ColorsPP.colorPickerTemplate = $(inner_html);
            ColorsPP.colorPickerElem = ColorsPP.colorPickerTemplate.find(".color-picker");


            // First check which sections the user has disabled to hide them
            var sections = ['option-show-sections-color-picker', 'option-show-sections-document-colors', 'option-show-sections-document-color-variables', 'option-show-sections-color-combinations', 'option-show-sections-function-variants'];
            sections.map(pref => {
                var checked = optionsPanel.findPref(pref);

                if (checked != false)
                    ColorsPP.colorPickerTemplate.find(".section-level[data-section='" + checked + "']").show();
            });


            var spectrum = ColorsPP.colorPickerElem.spectrum({
                flat: true,
                color: ColorsPP.clickedColorObject.color,
                showAlpha: true,
                showButtons: false,
                preferredFormat: ColorsPP.clickedColorObject.type,
                move: function (color) {
                    var container = jQuery(ColorsPP.colorPickerElem.spectrum("container")).closest(".color-plus-plus");

                    // Show new color in the comparing area
                    var colorValue = color.toString();
                    container.find(".new-color").css("background-color", colorValue);
                    container.find(".color-string").val(colorValue + "");

                    // Find color combination
                    ColorsPP.combineColors(color);
                },
                show: function (color) {
                    ColorsPP.combineColors(color);

                    // is it a function
                    if (ColorsPP.clickedColorObject.category == 'functions') {
                        ColorsPP.functionVariants(ColorsPP.clickedColorObject.initColor);
                        ColorsPP.colorPickerTemplate.find(".color-picker-section").hide();
                    } else
                        ColorsPP.colorPickerTemplate.find(".function-variants-section").hide();
                }
            });

            // Convert colors (hex, rgb, etc ..)
            ColorsPP.colorPickerTemplate.find(".colors-types > span").on("click", function () {
                var _this = jQuery(this);
                /* set ColorsPP.colorPickerTemplate again because click works
                after the template is being assigend to linewidget
                To workaround this we assign the var again to the same element so functions like "move" 
                will poulate the data properly
                */
                ColorsPP.colorPickerTemplate = _this.closest(".color-plus-plus");

                // Switch view to relevant type
                _this.parent().attr("data-type", _this.attr("data-type"));
                var colorValue = ColorsPP.getColorValue(_this.attr("data-type"));

                // populate the input
                ColorsPP.colorPickerTemplate.find(".color-string").val(colorValue + "");

                // Swtich spectrum prefered format
                ColorsPP.colorPickerTemplate.find(".color-picker").spectrum("option", "preferredFormat", _this.attr("data-type"));
            });

            // handle hovering over colors (show color name and line number)
            ColorsPP.colorPickerTemplate.find(".document-variables-list, .document-colors-list").on("mouseover", "li", function () {
                    var _this = jQuery(this);
                    _this.closest(".section-level").find(".color-name").text(_this.attr("data-color"));
                    _this.closest(".section-level").find(".line-number").text(_this.attr("data-line"));
                }).on("mouseout", "li", function () {
                    var _this = jQuery(this);
                    _this.closest(".section-level").find(".color-name").text("");
                    _this.closest(".section-level").find(".line-number").text("");
                })

                // Handle colors click (in document colors and in variables colors sections)
                .on("click", "li", function () {
                    var _this = jQuery(this);
                    var color = _this.attr("data-color");
                    ColorsPP.setColor(color);
                });

            // Handle clicking on select button

            ColorsPP.colorPickerTemplate.find(".select-color").on("click", function () {
                var colorValue = jQuery(this).closest(".color-plus-plus").find(".color-string").val();
                ColorsPP.setColor(colorValue);
                return true;
            });

            // Handle clicking on color combinations
            ColorsPP.colorPickerTemplate.find(".color-combinations-section").on("click", "li", function () {
                var _this = jQuery(this);
                var color = _this.attr("data-color");
                ColorsPP.setColor(color);
            });

            // Handle clicking on function variants
            ColorsPP.colorPickerTemplate.find(".function-variants-section").on("click", "li", function () {
                var _this = jQuery(this);
                var percentage = _this.attr("data-percentage");
                var degree = _this.attr("data-degree");
                var fraction = _this.attr("data-fraction");

                if (typeof degree != "undefined")
                    ColorsPP.setColorPercentage(degree);
                else if (typeof fraction != "undefined")
                    ColorsPP.setColorPercentage(fraction);
                else
                    ColorsPP.setColorPercentage(percentage + "%");

            });

            // Handle clicking on close picker
            ColorsPP.colorPickerTemplate.find(".close-color-picker").on("click", function () {
                ColorsPP.widgetInstance.clear();
            });


            ColorsPP.widgetLine = line;
            ColorsPP.widgetInstance = ColorsPP.editor.addLineWidget(line, ColorsPP.colorPickerTemplate[0], {
                coverGutter: true
            });



            // When spectrum is used in flat mode it will not set the color
            // we need to "reset" it for the container to show the color being selected on the picker
            ColorsPP.colorPickerElem.spectrum("reflow");
        },
        setColor: function (color) {
            var category = (ColorsPP.clickedColorObject.category == "functions");

            // Set seletion and then replace it with chosen color
            ColorsPP.editor.setSelection({
                line: ColorsPP.clickedColorObject.line,
                ch: (!category) ? ColorsPP.clickedColorObject.start : ColorsPP.clickedColorObject.paramStart
            }, {
                line: ColorsPP.clickedColorObject.line,
                ch: (!category) ? ColorsPP.clickedColorObject.end : ColorsPP.clickedColorObject.paramEnd
            });

            ColorsPP.editor.replaceSelection(color);

            // Hide widget
            ColorsPP.widgetInstance.clear();

            // Update file
            ColorsPP.onChanged();
        },
        setColorPercentage: function (percentage) {
            var category = (ColorsPP.clickedColorObject.category == "functions");

            // Set seletion and then replace it with chosen color
            ColorsPP.editor.setSelection({
                line: ColorsPP.clickedColorObject.line,
                ch: ColorsPP.clickedColorObject.percentageStart
            }, {
                line: ColorsPP.clickedColorObject.line,
                ch: ColorsPP.clickedColorObject.percentageEnd
            });

            ColorsPP.editor.replaceSelection(percentage);

            // Hide widget
            ColorsPP.widgetInstance.clear();

            // Update file
            ColorsPP.onChanged();
        },
        combineColors: function (initColor) {
            // Get various colors combination
            var combinations = {
                'analogous': initColor.analogous(),
                'monochromatic': initColor.monochromatic(),
                'splitcomplement': initColor.splitcomplement(),
                'triad': initColor.triad(),
                'tetrad': initColor.tetrad()
            };

            jQuery.each(combinations, function (key, value) {
                var content = value.map(function (color) {
                    var color = color.toHexString();
                    return "<li style='background-color:" + color + ";' data-color='" + color + "'></li>";
                });
                ColorsPP.colorPickerTemplate.find(".color-combinations-" + key + " ul").html(content);
            });

            // complement
            var complement = "<li style='background-color:" + initColor.complement() + ";'></li>";
            ColorsPP.colorPickerTemplate.find(".color-combinations-complement ul").html(complement);
        },
        functionVariants: function (initColor, secondColor) {

            // First get function name
            var functionName = ColorsPP.clickedColorObject.functionName;
            var percentage = ["5", "10", "15", "20", "25", "30", "30", "40", "45", "50", "55", "60", "65", "70", "75", "80", "85", "90", "95", "100"];
            var threesixty = ["15", "30", "45", "60", "75", "90", "105", "120", "135", "150", "165", "180", "195", "210", "225", "240", "255", "270", "285", "300", "315", "330", "345"];
            var proccessedColor = "";

            // Get final color based on function name
            switch (functionName) {
                case "darken":
                    percentage.forEach(percentage => {
                        var darker = tinycolor(initColor).darken(percentage);
                        var color = (darker.isDark()) ? "#ffffff" : "#000000";
                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + darker + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "lighten":
                    percentage.forEach(percentage => {
                        var lighter = tinycolor(initColor).lighten(percentage);
                        var color = (lighter.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + lighter + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "fadein":
                    percentage.forEach(percentage => {
                        var faded = tinycolor(initColor).fadein(percentage);
                        var color = (faded.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + faded + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "fade-in":
                case "opacify":
                    percentage.forEach(percentage => {
                        var fraction = percentage / 100;
                        var faded = tinycolor(initColor).fadein(fraction);
                        var color = (faded.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-fraction='" + fraction + "' style='background-color: " + faded + "; color: " + color + "'>" + fraction + "</li>";
                    });
                    break;

                case "fadeout":
                    percentage.forEach(percentage => {
                        var faded = tinycolor(initColor).fadeout(percentage);
                        var color = (faded.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + faded + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "fade-out":
                case "transparentize":
                    percentage.forEach(percentage => {
                        var fraction = percentage / 100;
                        var faded = tinycolor(initColor).fadeout(fraction);
                        var color = (faded.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-fraction='" + fraction + "' style='background-color: " + faded + "; color: " + color + "'>" + fraction + "</li>";
                    });
                    break;

                case "fade":
                    percentage.forEach(percentage => {
                        var alpha = percentage / 100;
                        var fade = tinycolor(initColor).setAlpha(alpha);
                        var color = (fade.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + fade + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "saturate":
                    percentage.forEach(percentage => {
                        var saturate = tinycolor(initColor).saturate(percentage);
                        var color = (saturate.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + saturate + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "desaturate":
                    percentage.forEach(percentage => {
                        var desaturate = tinycolor(initColor).desaturate(percentage);
                        var color = (saturate.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + desaturate + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "spin":
                    threesixty.forEach(degree => {
                        var spin = tinycolor(initColor).spin(degree);
                        var color = (spin.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-degree='" + degree + "' style='background-color: " + spin + "; color: " + color + "'>" + degree + "</li>";
                    });
                    break;

                case "tint":
                    percentage.forEach(percentage => {
                        var tint = tinycolor.mix("#ffffff", initColor, percentage);
                        var color = (tint.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + tint + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;

                case "shade":
                    percentage.forEach(percentage => {
                        var shade = tinycolor.mix("#000000", initColor, percentage);
                        var color = (shade.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + shade + "; color: " + color + "'>" + percentage + "%</li>";
                    });

                    break;

                case "grayscale":
                case "greyscale":
                    proccessedColor = "No Need :)";
                    break;

                case "mix":
                    percentage.forEach(percentage => {
                        var mix = tinycolor.mix(initColor, secondColor, percentage);
                        var color = (mix.isDark()) ? "#ffffff" : "#000000";

                        proccessedColor += "<li data-percentage='" + percentage + "' style='background-color: " + mix + "; color: " + color + "'>" + percentage + "%</li>";
                    });
                    break;
            }

            if (proccessedColor == "No Need :)")
                ColorsPP.colorPickerTemplate.find(".function-variants-section").hide();
            else
                ColorsPP.colorPickerTemplate.find(".function-variants-section ul").html(proccessedColor);
        },
        getColorValue: function (type) {
            var color;
            // get the appropiate function for the selected element
            switch (type) {
                case 'hex':
                    color = ColorsPP.colorPickerElem.spectrum("get").toHexString();
                    break;
                case 'rgb':
                    color = ColorsPP.colorPickerElem.spectrum("get").toRgbString();
                    break;
                case 'hsl':
                    color = ColorsPP.colorPickerElem.spectrum("get").toHslString();
                    break;
                case 'hsv':
                    color = ColorsPP.colorPickerElem.spectrum("get").toHsvString();
                    break;
            }
            return color;
        },
        findColors: function (string, line) {
            var colorsRegex = [];
            var returnResults = {
                result: false,
                data: []
            };

            colorsRegex.push({
                type: "hex",
                regex: /#([0-9a-f]{6}|[0-9a-f]{3})/ig
            });
            colorsRegex.push({
                type: "rgb",
                regex: /(rgba|rgb)\([^)]+\)/ig
            });
            colorsRegex.push({
                type: "hsl",
                regex: /(hsla|rgb)\([^)]+\)/ig
            });
            colorsRegex.push({
                type: "hsv",
                regex: /(hsva|hsv)\([^)]+\)/ig
            });

            colorsRegex.forEach(function (element) {
                var match;
                while (match = element.regex.exec(string)) {

                    var start = match.index;
                    var end = start + match[0].length;
                    var color = match[0];

                    // get start and end position
                    var colorMeta = {
                        start: start,
                        end: end,
                        color: color,
                        type: element.type,
                        line: line,
                        category: 'colors'
                    };


                    returnResults.data.push(colorMeta);

                }
            });

            // Find names colors (black, white, darkblue .. etc)
            // first get all keys into a single line using | seprator
            var names = ColorsPP.namedColorsNames.join("|");

            // Search regex for any color names in the array that we have but it should not be
            // preceeded by @, - or $ since these are var symbols in LESS.js, CSS and SASS respectively)
            var search = new RegExp("[^@\\-]\\b(" + names + ")\\b", "ig");

            var match;
            while (match = search.exec(string)) {

                var start = match.index + 1;
                var end = start + match[0].length - 1;

                var colorName = match[0].replace('"', "").trim();
                var colorIndex = ColorsPP.namedColorsNames.indexOf(colorName);
                var colorValue = ColorsPP.namedColorsHex[colorIndex];

                // get start and end position
                var colorMeta = {
                    start: start,
                    end: end,
                    color: colorValue,
                    type: 'hex',
                    line: line,
                    category: 'colors'
                };

                returnResults.data.push(colorMeta);
            }

            if (Object.keys(returnResults.data).length > 0)
                returnResults.result = true;

            return returnResults;
        },
        init: function () {
            // initiate options panel
            optionsPanel.init();

            // Get editor
           ColorsPP.activeEditor = EditorManager.getActiveEditor();

            $(EditorManager).on("activeEditorChange", ColorsPP.onChanged);
            if (ColorsPP.activeEditor) {
                // if the file type is not supported (ie: not needed to have color identification)
                // then dont go on
                if (!ColorsPP.checkEnabledFiles())
                    return true;
                /*
                For now, direct access to the underlying CodeMirror
                object is still possible via _codeMirror --
                but this is considered deprecated and may go away.
                */

                ColorsPP.editor = ColorsPP.activeEditor._codeMirror;

                $(ColorsPP.editor).on("change", ColorsPP.onChanged);
                $("#editor-holder").on("mousedown", ColorsPP.onClicked);


                
                ColorsPP.initGutter();
                ColorsPP.showColorMarks();
                ColorsPP.prepareColorBox();
            }

            // Listen to changes and update the extension functions
            optionsPanel.prefObj.on("change", function () {
                ColorsPP.onChanged();
            });

            // On save make sure that we regenerate and show the colors again
            DocumentManager.on("documentSaved", function (event, doc) {
                ColorsPP.onChanged();
            });

        },
        prepareColorBox: function () {
            // get all unique documetns colors
            var uniqueColors = [];

            ColorsPP.colors.forEach(function (element) {
                var color = element.color;
                var line = element.line + 1; // +1 because array is 0 indexed

                if (uniqueColors.indexOf(color) == -1) {
                    uniqueColors.push(color);

                    var liElement = "<li style='background-color:" + color + ";' data-color='" + color + "' data-line='" + line + "'></li>";
                    ColorsPP.documentColors += liElement;
                }
            });

            // Get all unique document varaiblaes
            var uniqueVars = [];
            ColorsPP.variables.forEach(function (element) {
                var color = element.color;
                var line = element.line + 1; // +1 because array is 0 indexed
                var varaible = element.var;

                if (uniqueVars.indexOf(varaible) == -1) {
                    uniqueVars.push(varaible);

                    var liElement = "<li style='background-color:" + color + ";' data-color='" + varaible + "' data-line='" + line + "'></li>";
                    ColorsPP.documentVariables += liElement;
                }
            });
        },

        initGutter: function () {
            // Clear colors gutter
            ColorsPP.editor.clearGutter(ColorsPP.gutterName);

            // Setup colors gutters
            var gutters = ColorsPP.editor.getOption("gutters").slice(0);
            var str = gutters.join('');

            if (str.indexOf(ColorsPP.gutterName) === -1) {
                gutters.unshift(ColorsPP.gutterName);
                ColorsPP.editor.setOption("gutters", gutters);
            }
        },

        showGutterColor: function (options) {
            // Show gutter colors 
            var cm = ColorsPP.editor;
            var marker = $("<i>")
                .addClass(options.className)
                .html("&nbsp;").css('background-color', options.color);

            cm.setGutterMarker(options.line, ColorsPP.gutterName, marker[0]);
        },
        checkEnabledFiles: function () {
            // Check which types of files have been enabled for the extension
            var fileLanguage = ColorsPP.activeEditor.document.file.name.split('.').pop();
            var isEnabled = optionsPanel.findPref("options-enable-extension-" + fileLanguage);
            var isAllEnabled = optionsPanel.findPref("options-enable-extension-all");

            if (isAllEnabled)
                return true;
            else if (isEnabled)
                return true;
            else
                return false;
        },
        getFileType: function (files) {
          // Check current files against the files array 
            var currentFile = ColorsPP.activeEditor.document.file.name.split('.').pop();
            var result = false;
            files.forEach(fileName => {
                if (currentFile == fileName)
                    result = true;
            });

            return result;

        }
    }

    // init after appReady
    AppInit.appReady(function () {
        setTimeout(ColorsPP.init, 1000);
    });

});
