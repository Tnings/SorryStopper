/**
 * @name SorryStopper
 * @author Mayb
 * @authorId 358429132272435210
 * @version 1.0.0
 * @description Warns you about apologizing
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			
		}
		start () {this.load();}
		stop () {}
		
	} : (([Plugin, BDFDB]) => {
		var languages, dictionaries, langDictionaries, languageToasts, checkTimeout, currentText;
	
		return class SpellCheck extends Plugin {
			onLoad () {
				languages = {};
				dictionaries = {};
				langDictionaries = {};
				languageToasts = {};
				
				this.defaults = {
					general: {
						downloadDictionary:			{value: false, 								description: "Use local Dictionary File (downloads Dictionary on first Usage)"}
					},
					choices: {
						dictionaryLanguage:			{value: "en", 	force: true,				description: "Primary Language"},
						secondaryLanguage:			{value: "-", 	force: false,				description: "Secondary Language"}
					},
					amounts: {
						maxSimilarAmount:			{value: 6, 		min: 1,		max: 30,		description: "Maximal Amount of suggested Words"}
					}
				};
			
				this.modulePatches = {
					componentDidMount: [
						"ChannelTextAreaEditor"
					],
					componentDidUpdate: [
						"ChannelTextAreaEditor"
					]
				};
				
				this.css = `
					${BDFDB.dotCNS._spellcheckoverlay + BDFDB.dotCN._spellcheckerror} {
						background: rgba(255,0,0,0.1);
						border-bottom-color: red;
						border-bottom-width: 2px;
						border-bottom-style: solid;
						border-radius: 1px;
					}
				`;
			}
			

			processChannelTextAreaEditor (e) {
				let newText = BDFDB.SlateUtils.toTextValue(e.instance.props.richValue);
				if (newText != currentText) {
					currentText = newText;
					BDFDB.DOMUtils.remove(e.node.parentElement.querySelectorAll(BDFDB.dotCN._spellcheckoverlay));
					BDFDB.TimeUtils.clear(checkTimeout);
					checkTimeout = BDFDB.TimeUtils.timeout(_ => {
						let overlay = e.node.cloneNode(true), wrapper = BDFDB.DOMUtils.getParent(BDFDB.dotCN.textareainner, e.node);
						BDFDB.DOMUtils.addClass(overlay, BDFDB.disCN._spellcheckoverlay);
						let style = Object.assign({}, getComputedStyle(e.node));
						for (let i in style) if (i.indexOf("webkit") == -1 && isNaN(parseInt(i))) overlay.style[i] = style[i];
						overlay.style.setProperty("color", "transparent", "important");
						overlay.style.setProperty("background", "none", "important");
						overlay.style.setProperty("mask", "none", "important");
						overlay.style.setProperty("pointer-events", "none", "important");
						overlay.style.setProperty("position", "absolute", "important");
						overlay.style.setProperty("left", BDFDB.DOMUtils.getRects(e.node).left - BDFDB.DOMUtils.getRects(wrapper).left + "px", "important");
						overlay.style.setProperty("width", BDFDB.DOMUtils.getRects(e.node).width - style.paddingLeft - style.paddingRight + "px", "important");
						overlay.style.setProperty("height", style.height, "important");
						for (let child of overlay.querySelectorAll("*")) {
							child.style.setProperty("color", "transparent", "important");
							child.style.setProperty("background-color", "transparent", "important");
							child.style.setProperty("border-color", "transparent", "important");
							child.style.setProperty("text-shadow", "none", "important");
							child.style.setProperty("object-position", "-999999px -999999px", "important");
							child.style.setProperty("pointer-events", "none", "important");
							if (child.getAttribute("data-slate-string") && child.parentElement.getAttribute("data-slate-leaf")) {
								let newline = child.querySelector("br");
								if (newline) newline.remove();
								child.innerHTML = this.spellCheckText(child.textContent);
								if (newline) child.appendChild(newline);
							}
						}
						e.node.parentElement.appendChild(overlay);
					}, 300);
				}
			}

			spellCheckText (string) {
				let htmlString = [];
				let splitter = "!?!?!?!?!?!?!?!" + this.name + BDFDB.NumberUtils.generateId() + this.name + "!?!?!?!?!?!?!?!";
				string.replace(/([0-9\ \@\>\<\|\,\;\.\:\-\_\=\#\+\*\~\[\]\(\)\{\}\\\/\&\^\t\r\n])/g, "$1" + splitter).split(splitter).forEach(word => {
					let execReturn = /[0-9\ \@\>\<\|\,\;\.\:\-\_\=\#\+\*\~\[\]\(\)\{\}\\\/\&\^\t\r\n]$/g.exec(word);
					if (execReturn) word = word.slice(0, execReturn[0].length * -1);
					htmlString.push(`<span class="${this.isWordNotInDictionary(word) ? BDFDB.disCN._spellcheckerror : ""}" style="color: transparent !important; text-shadow: none !important;">${BDFDB.StringUtils.htmlEscape(word)}</span>`);
					if (execReturn) htmlString.push(`<span>${execReturn[0]}</span>`);
				});
				return htmlString.join("").replace(/\n /g, "\n");
			}

			isWordNotInDictionary (unformatedWord) {
				return "sorry".includes(unformatedWord.toLowerCase());
			}

			
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
