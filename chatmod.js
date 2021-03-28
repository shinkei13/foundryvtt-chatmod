class ChatMod {
	    
    renderChatLog(chatlog, html, data) {
    // Prepend inline CSS to the chatlog to style the chat messages.
		const mod_html = $(`
		<div id="chatmod"  class="chat-mod-select flexrow">
				<select name="chatmod-options">
				</select>
		</div>
		`);
		html.find("#chat-controls").after(mod_html);
		const select = html.find(".chat-mod-select select");
		select.change(e => {
			this.lastSelection = select.val();
            
            // Prepend '/w' if Whisper is selected
            let $chat = html.find('#chat-form textarea');
            if (select.val() == '/w' && $chat.val() == '') {
                if (whisperText == "") {
                    whisperText = "/w"
                }
                $chat.val(whisperText);
            }
            if (select.val() != '/w' && $chat.val() == '/w') {
                $chat.val('');
            }
		})        
		this.updateUserChat(html)
    }

    updateUser(user, data) {
        if (user.id == game.user.id && data.character !== undefined) {
            this.updateUserChat(ui.chat.element)
        }
    }

    controlToken() {
        this.updateUserChat(ui.chat.element)
    }
	
	chatMessage(chatLog, message, chatData) {
		let html = ui.chat.element;
		const select = html.find(".chat-mod-select select");
		if (select.val() != null) {
			let prefix = select.val();
			
			// Check if the message begins with any command.
			let [command, match] = chatLog.constructor.parse(message);
			
			if ( command === "none" ) {
				// If there is no command, insert the prefix and reprocess.
				chatLog.processMessage(prefix + " " + message);
				return false;
			}
			
			// Otherwise do nothing.
			return true;
		}
	}
    
    renderChatMessage(message, html, data) {
        // Prepend '/w' if Whisper is selected
        let loghtml = ui.chat.element;
        let whisperTo = message.data.whisper.map(u => {
            let user = game.users.get(u);
            return user ? user.name : null;
        }).filter(n => n !== null).join(", ")

		const select = loghtml.find(".chat-mod-select select");
        
        if (select.val() == '/w') {
            whisperText = ("/w [" + whisperTo + "] ");
            let selectedOption = '/ooc'
                if (actors.length == 0) {
                    let selectedOption = '/ooc'
                }
                else {
                    let selectedOption = '/ic'
                }
            const prevOption = selectedOption;
            this.lastSelection = selectedOption;
            select.val(selectedOption);
        }
    }
	
	updateUserChat(html) {
        let actors = [];
        if (canvas != null) {
            for (let token of canvas.tokens.controlled) {
                if (token.actor)
                    actors.push(token.actor)
            }
            if (actors.length == 0 && game.user.character)
                actors.push(game.user.character);
        }
        let options = ""
        options += `<option value="/ooc">Out of Character</option>`;
		if (actors.length != 0) {
			options += `<option value="/ic">In Character</option>`
			options += `<option value="/em">Emotes (Actor Name...)</option>`
		}
		if (game.user.isGM && game.modules.get('CautiousGamemastersPack')?.active) {
			options += `<option value="/desc">Description</option>`
		}
        options += `<option value="/w">Whisper to [Player Name]</option>`;
        const select = html.find(".chat-mod-select select");
        const prevOption = select.val();
        select.html($(options));
        let selectedOption = this.lastSelection || prevOption || '/ooc';
		if (actors.length == 0) {
            if (selectedOption != '/ooc' && selectedOption != '/desc' && selectedOption != '/w') {
                selectedOption = '/ooc'
                console.log('!OOC')
            }
		}
        select.val(selectedOption);
    }
}

ChatModSingleton = new ChatMod()
whisperText = ""

Hooks.on('renderChatLog', ChatModSingleton.renderChatLog.bind(ChatModSingleton))
Hooks.on('updateUser', ChatModSingleton.updateUser.bind(ChatModSingleton))
Hooks.on('controlToken', ChatModSingleton.controlToken.bind(ChatModSingleton))
Hooks.on('chatMessage', ChatModSingleton.chatMessage.bind(ChatModSingleton))
Hooks.on('renderChatMessage', ChatModSingleton.renderChatMessage.bind(ChatModSingleton))