// ═══════════════════════════════════════════════════════════════
// TIPTAP EDITOR — Local Bundle Edition (no CDN)
// Uses locally bundled ../src/addons/GhRank/dist/tiptap-editor.min.js
// which exposes window.TiptapEditor = { Editor, Node, Mark,
//   mergeAttributes, StarterKit, Placeholder, createEditor }.
//
// This version is CDN-free. The following features that previously
// relied on separate CDN packages are reimplemented locally:
//   - Highlight  -> custom Mark (no @tiptap/extension-highlight)
//   - Underline  -> custom Mark (StarterKit v3 may not include it)
//   - BubbleMenu -> DOM-based inline toolbar on selection
//   - FloatingMenu -> DOM-based block toolbar on empty paragraph
//   - SlashCommand -> "/" triggers a Notion-style command palette
//     (DOM keydown listener + Editor events, no PM plugin)
//   - EmojiNode -> inline node for ":name:" autocomplete
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var T = window.TiptapEditor;
  if (!T || !T.Editor) {
    console.error('[Tiptap] Local bundle missing. Expected window.TiptapEditor.');
    return;
  }

  var Editor = T.Editor;
  var Node = T.Node;
  var Mark = T.Mark;
  var mergeAttributes = T.mergeAttributes;
  var StarterKit = T.StarterKit;
  var Placeholder = T.Placeholder;

  // ── DOM References ──
  var editorEl = document.getElementById('tiptapEditor');
  var bubbleEl = document.getElementById('bubbleMenu');
  var floatingEl = document.getElementById('floatingMenu');
  if (!editorEl) {
    console.warn('[Tiptap] #tiptapEditor not found on this page.');
    return;
  }

  // ═══════════════════════════════════════════════════════════════
  // UNDERLINE — StarterKit v3 includes Underline natively, so we do
  // NOT define a custom one. Defining our own would create a duplicate
  // "underline" extension and trigger a Tiptap warning. The
  // toggleUnderline command is provided by StarterKit.
  // We keep `Underline = null` so the extensions list below can skip it.
  // ═══════════════════════════════════════════════════════════════
  var Underline = null;

  // ═══════════════════════════════════════════════════════════════
  // HIGHLIGHT MARK — custom, multicolor support
  // ═══════════════════════════════════════════════════════════════
  var Highlight = Mark.create({
    name: 'highlight',
    addAttributes: function () {
      return {
        color: { default: null, parseHTML: function (el) { return el.getAttribute('data-color') || el.style.backgroundColor; } },
      };
    },
    parseHTML: function () {
      return [
        { tag: 'mark' },
        { tag: 'span[data-type="highlight"]' },
      ];
    },
    renderHTML: function (ref) {
      var attrs = {};
      var color = ref.HTMLAttributes && ref.HTMLAttributes.color;
      if (color) {
        attrs['data-type'] = 'highlight';
        attrs.style = 'background-color:' + color;
      } else {
        attrs['data-type'] = 'highlight';
      }
      return ['mark', mergeAttributes(ref.HTMLAttributes, attrs), 0];
    },
    addCommands: function () {
      var self = this;
      return {
        toggleHighlight: function (attrs) {
          return function (ctx) { return ctx.commands.toggleMark(self.name, attrs); };
        },
      };
    },
  });

  // ═══════════════════════════════════════════════════════════════
  // EMOJI NODE — inline node for emoji rendering
  // ═══════════════════════════════════════════════════════════════
  var EmojiNode = Node.create({
    name: 'emoji',
    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,

    addAttributes: function () {
      return {
        name: { default: null },
        emoji: { default: null },
      };
    },

    parseHTML: function () {
      return [{ tag: 'span[data-type="emoji"]' }];
    },

    renderHTML: function (ref) {
      var HTMLAttributes = ref.HTMLAttributes;
      var node = ref.node;
      var emoji = node.attrs.emoji || '';
      return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'emoji' }), emoji];
    },

    addCommands: function () {
      var self = this;
      return {
        insertEmoji: function (attrs) {
          return function (ctx) {
            return ctx.commands.insertContent({ type: self.name, attrs: attrs });
          };
        },
      };
    },

    addInputRules: function () { return []; },
  });

  // ── Common Emoji List ──
  var emojiList = [
    { name: 'grinning', emoji: '\u{1F600}' },
    { name: 'smiley', emoji: '\u{1F603}' },
    { name: 'smile', emoji: '\u{1F604}' },
    { name: 'grin', emoji: '\u{1F601}' },
    { name: 'laughing', emoji: '\u{1F606}' },
    { name: 'wink', emoji: '\u{1F609}' },
    { name: 'blush', emoji: '\u{1F60A}' },
    { name: 'heart_eyes', emoji: '\u{1F60D}' },
    { name: 'kissing_heart', emoji: '\u{1F618}' },
    { name: 'thinking', emoji: '\u{1F914}' },
    { name: 'neutral_face', emoji: '\u{1F610}' },
    { name: 'expressionless', emoji: '\u{1F611}' },
    { name: 'unamused', emoji: '\u{1F612}' },
    { name: 'sweat_smile', emoji: '\u{1F605}' },
    { name: 'joy', emoji: '\u{1F602}' },
    { name: 'sob', emoji: '\u{1F62D}' },
    { name: 'angry', emoji: '\u{1F621}' },
    { name: 'rage', emoji: '\u{1F621}' },
    { name: 'scream', emoji: '\u{1F631}' },
    { name: 'ghost', emoji: '\u{1F47B}' },
    { name: 'skull', emoji: '\u{1F480}' },
    { name: 'thumbsup', emoji: '\u{1F44D}' },
    { name: 'thumbsdown', emoji: '\u{1F44E}' },
    { name: 'clap', emoji: '\u{1F44F}' },
    { name: 'wave', emoji: '\u{1F44B}' },
    { name: 'fire', emoji: '\u{1F525}' },
    { name: 'star', emoji: '\u{2B50}' },
    { name: 'zap', emoji: '\u{26A1}' },
    { name: 'heart', emoji: '\u2764\u{FE0F}' },
    { name: 'broken_heart', emoji: '\u{1F494}' },
    { name: '100', emoji: '\u{1F4AF}' },
    { name: 'check', emoji: '\u2705' },
    { name: 'x', emoji: '\u274C' },
    { name: 'warning', emoji: '\u{26A0}\u{FE0F}' },
    { name: 'rocket', emoji: '\u{1F680}' },
    { name: 'eyes', emoji: '\u{1F440}' },
    { name: 'brain', emoji: '\u{1F9E0}' },
    { name: 'muscle', emoji: '\u{1F4AA}' },
    { name: 'party', emoji: '\u{1F389}' },
    { name: 'trophy', emoji: '\u{1F3C6}' },
    { name: 'medal', emoji: '\u{1F3C5}' },
    { name: 'bulb', emoji: '\u{1F4A1}' },
    { name: 'book', emoji: '\u{1F4D6}' },
    { name: 'gift', emoji: '\u{1F381}' },
    { name: 'cake', emoji: '\u{1F370}' },
    { name: 'coffee', emoji: '\u{2615}' },
    { name: 'beer', emoji: '\u{1F37A}' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // EMOJI AUTOCOMPLETE
  // ═══════════════════════════════════════════════════════════════
  var _emoji = { isOpen: false, query: '', selectedIndex: 0, items: [], range: { from: 0, to: 0 }, popupEl: null };

  function findEmojiRange(editor) {
    try {
      var state = editor.state;
      var $from = state.selection.$from;
      var textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      var match = textBefore.match(/:([a-z_0-9]*)$/);
      if (match) {
        var matchLen = match[0].length;
        return { query: match[1], range: { from: $from.pos - matchLen, to: $from.pos } };
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function filterEmojis(query) {
    if (!query) return emojiList.slice(0, 20);
    var q = query.toLowerCase();
    return emojiList.filter(function (e) { return e.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 20);
  }

  function buildEmojiPopup() {
    var popup = document.createElement('div');
    popup.className = 'emoji-popup';
    var items = _emoji.items;
    if (items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'emoji-empty';
      empty.textContent = 'No matching emoji';
      popup.appendChild(empty);
      return popup;
    }
    items.forEach(function (item, idx) {
      var row = document.createElement('div');
      row.className = 'emoji-item' + (idx === _emoji.selectedIndex ? ' is-selected' : '');
      var glyph = document.createElement('span');
      glyph.className = 'emoji-item-glyph';
      glyph.textContent = item.emoji;
      var name = document.createElement('span');
      name.className = 'emoji-item-name';
      name.textContent = ':' + item.name + ':';
      row.appendChild(glyph);
      row.appendChild(name);
      row.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); executeEmojiInsert(item); });
      row.addEventListener('mouseenter', function () { _emoji.selectedIndex = idx; highlightEmojiRows(); });
      popup.appendChild(row);
    });
    return popup;
  }

  function highlightEmojiRows() {
    if (!_emoji.popupEl) return;
    var rows = _emoji.popupEl.querySelectorAll('.emoji-item');
    rows.forEach(function (r, i) {
      r.classList.toggle('is-selected', i === _emoji.selectedIndex);
      if (i === _emoji.selectedIndex) r.scrollIntoView({ block: 'nearest' });
    });
  }

  function showEmojiPopup() {
    removeEmojiPopup();
    var ed = _slash.editorRef;
    if (!ed || !ed.view) return;
    var popup = buildEmojiPopup();
    _emoji.popupEl = popup;
    try {
      var coords = ed.view.coordsAtPos(_emoji.range.from);
      var editorRect = editorEl.getBoundingClientRect();
      var left = Math.max(0, Math.min(coords.left - editorRect.left, editorRect.width - 240));
      var top = coords.bottom - editorRect.top + 4;
      popup.style.position = 'absolute';
      popup.style.left = left + 'px';
      popup.style.top = top + 'px';
      popup.style.zIndex = '1002';
      var composeBody = editorEl.closest('.compose-body');
      if (composeBody) composeBody.appendChild(popup); else document.body.appendChild(popup);
    } catch (e) {
      popup.style.position = 'absolute';
      popup.style.left = '0';
      popup.style.top = '100%';
      popup.style.zIndex = '1002';
      var cb = editorEl.closest('.compose-body');
      if (cb) cb.appendChild(popup); else document.body.appendChild(popup);
    }
    _emoji.isOpen = true;
  }

  function removeEmojiPopup() {
    if (_emoji.popupEl) { if (_emoji.popupEl.parentNode) _emoji.popupEl.remove(); _emoji.popupEl = null; }
    _emoji.isOpen = false; _emoji.query = ''; _emoji.selectedIndex = 0;
  }

  function executeEmojiInsert(item) {
    var ed = _slash.editorRef;
    if (!ed) return;
    var range = { from: _emoji.range.from, to: _emoji.range.to };
    _emoji.isOpen = false;
    if (_emoji.popupEl) { if (_emoji.popupEl.parentNode) _emoji.popupEl.remove(); _emoji.popupEl = null; }
    ed.chain().focus().deleteRange(range).insertContent({ type: 'emoji', attrs: { name: item.name, emoji: item.emoji } }).run();
    _emoji.query = ''; _emoji.selectedIndex = 0; _emoji.range = { from: 0, to: 0 };
  }

  function updateEmojiPopup() {
    var ed = _slash.editorRef;
    if (!ed || !ed.view.hasFocus() || _slash.isOpen) { if (_emoji.isOpen) removeEmojiPopup(); return; }
    var data = findEmojiRange(ed);
    if (data) {
      var items = filterEmojis(data.query);
      _emoji.items = items; _emoji.range = data.range; _emoji.query = data.query;
      if (items.length === 0 && data.query.length > 1) { removeEmojiPopup(); return; }
      if (_emoji.selectedIndex >= items.length) _emoji.selectedIndex = Math.max(0, items.length - 1);
      showEmojiPopup();
    } else {
      if (_emoji.isOpen) removeEmojiPopup();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SLASH COMMAND ITEMS
  // ═══════════════════════════════════════════════════════════════
  var slashItems = [
    { title: 'Text', desc: 'Plain text block', icon: 'T', cmd: 'paragraph', section: 'BASIC BLOCKS' },
    { title: 'Heading 1', desc: 'Large section heading', icon: 'H1', cmd: 'heading1', section: 'BASIC BLOCKS' },
    { title: 'Heading 2', desc: 'Medium section heading', icon: 'H2', cmd: 'heading2', section: 'BASIC BLOCKS' },
    { title: 'Heading 3', desc: 'Small section heading', icon: 'H3', cmd: 'heading3', section: 'BASIC BLOCKS' },
    { title: 'Bullet List', desc: 'Unordered list', icon: '\u2022', cmd: 'bulletList', section: 'BASIC BLOCKS' },
    { title: 'Numbered List', desc: 'Ordered list', icon: '1.', cmd: 'orderedList', section: 'BASIC BLOCKS' },
    { title: 'Blockquote', desc: 'Quoted text block', icon: '\u275D', cmd: 'blockquote', section: 'BASIC BLOCKS' },
    { title: 'Code Block', desc: 'Code snippet', icon: '{ }', cmd: 'codeBlock', section: 'BASIC BLOCKS' },
    { title: 'Divider', desc: 'Horizontal separator', icon: '\u2014', cmd: 'divider', section: 'BASIC BLOCKS' },
    { title: 'Bold', desc: 'Bold text', icon: 'B', cmd: 'bold', section: 'INLINE FORMAT' },
    { title: 'Italic', desc: 'Italic text', icon: 'I', cmd: 'italic', section: 'INLINE FORMAT' },
    { title: 'Underline', desc: 'Underlined text', icon: 'U', cmd: 'underline', section: 'INLINE FORMAT' },
    { title: 'Strikethrough', desc: 'Struck-through text', icon: 'S', cmd: 'strike', section: 'INLINE FORMAT' },
    { title: 'Inline Code', desc: 'Code in text', icon: '<>', cmd: 'code', section: 'INLINE FORMAT' },
  ];

  var _slash = { isOpen: false, query: '', selectedIndex: 0, items: [], range: { from: 0, to: 0 }, popupEl: null, editorRef: null };

  function findSlashRange(editor) {
    try {
      var state = editor.state;
      var $from = state.selection.$from;
      var textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      var match = textBefore.match(/\/([a-zA-Z0-9]*)$/);
      if (match) {
        var matchLen = match[0].length;
        return { query: match[1], range: { from: $from.pos - matchLen, to: $from.pos } };
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function filterSlashItems(query) {
    if (!query) return slashItems.slice();
    var q = query.toLowerCase();
    return slashItems.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) !== -1
        || item.desc.toLowerCase().indexOf(q) !== -1
        || item.cmd.toLowerCase().indexOf(q) !== -1;
    });
  }

  function buildSlashPopup() {
    var popup = document.createElement('div');
    popup.className = 'slash-command-popup';
    var items = _slash.items;
    if (items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'slash-empty';
      empty.textContent = 'No results';
      popup.appendChild(empty);
      return popup;
    }
    var sections = {};
    items.forEach(function (item) { if (!sections[item.section]) sections[item.section] = []; sections[item.section].push(item); });
    Object.keys(sections).forEach(function (name) {
      var header = document.createElement('div');
      header.className = 'slash-section-header';
      header.textContent = name;
      popup.appendChild(header);
      sections[name].forEach(function (item) {
        var globalIdx = _slash.items.indexOf(item);
        var row = document.createElement('div');
        row.className = 'slash-item' + (globalIdx === _slash.selectedIndex ? ' is-selected' : '');
        var icon = document.createElement('span');
        icon.className = 'slash-item-icon';
        icon.textContent = item.icon;
        var text = document.createElement('span');
        text.className = 'slash-item-text';
        text.textContent = item.title;
        var desc = document.createElement('span');
        desc.className = 'slash-item-desc';
        desc.textContent = item.desc;
        row.appendChild(icon); row.appendChild(text); row.appendChild(desc);
        row.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); executeSlashCommand(item); });
        row.addEventListener('mouseenter', function () { _slash.selectedIndex = globalIdx; highlightSlashRows(); });
        popup.appendChild(row);
      });
    });
    return popup;
  }

  function highlightSlashRows() {
    if (!_slash.popupEl) return;
    var rows = _slash.popupEl.querySelectorAll('.slash-item');
    rows.forEach(function (r, i) {
      r.classList.toggle('is-selected', i === _slash.selectedIndex);
      if (i === _slash.selectedIndex) r.scrollIntoView({ block: 'nearest' });
    });
  }

  function showSlashPopup() {
    removeSlashPopup();
    var editor = _slash.editorRef;
    if (!editor || !editor.view) return;
    var popup = buildSlashPopup();
    _slash.popupEl = popup;
    try {
      var coords = editor.view.coordsAtPos(_slash.range.from);
      var editorRect = editorEl.getBoundingClientRect();
      var left = Math.max(0, Math.min(coords.left - editorRect.left, editorRect.width - 320));
      var top = coords.bottom - editorRect.top + 4;
      popup.style.position = 'absolute';
      popup.style.left = left + 'px';
      popup.style.top = top + 'px';
      popup.style.zIndex = '1001';
      var composeBody = editorEl.closest('.compose-body');
      if (composeBody) { composeBody.style.position = 'relative'; composeBody.appendChild(popup); }
      else { popup.style.position = 'fixed'; popup.style.left = coords.left + 'px'; popup.style.top = (coords.bottom + 4) + 'px'; document.body.appendChild(popup); }
    } catch (e) {
      popup.style.position = 'absolute';
      popup.style.left = '0';
      popup.style.top = '100%';
      popup.style.zIndex = '1001';
      var cb = editorEl.closest('.compose-body');
      if (cb) cb.appendChild(popup); else document.body.appendChild(popup);
    }
    _slash.isOpen = true;
    if (floatingEl) floatingEl.style.display = 'none';
  }

  function removeSlashPopup() {
    if (_slash.popupEl) { if (_slash.popupEl.parentNode) _slash.popupEl.remove(); _slash.popupEl = null; }
    _slash.isOpen = false; _slash.query = ''; _slash.selectedIndex = 0;
    if (floatingEl) floatingEl.style.display = '';
  }

  function executeSlashCommand(item) {
    var editor = _slash.editorRef;
    if (!editor) return;
    var range = { from: _slash.range.from, to: _slash.range.to };
    _slash.isOpen = false;
    if (_slash.popupEl) { if (_slash.popupEl.parentNode) _slash.popupEl.remove(); _slash.popupEl = null; }
    var chain = editor.chain().focus().deleteRange(range);
    switch (item.cmd) {
      case 'paragraph': chain.setParagraph().run(); break;
      case 'heading1': chain.setHeading({ level: 1 }).run(); break;
      case 'heading2': chain.setHeading({ level: 2 }).run(); break;
      case 'heading3': chain.setHeading({ level: 3 }).run(); break;
      case 'bulletList': chain.setBulletList().run(); break;
      case 'orderedList': chain.setOrderedList().run(); break;
      case 'blockquote': chain.setBlockquote().run(); break;
      case 'codeBlock': chain.setCodeBlock().run(); break;
      case 'divider': chain.setHorizontalRule().run(); break;
      case 'bold': chain.toggleBold().run(); break;
      case 'italic': chain.toggleItalic().run(); break;
      case 'underline': chain.toggleUnderline().run(); break;
      case 'strike': chain.toggleStrike().run(); break;
      case 'code': chain.toggleCode().run(); break;
    }
    _slash.query = ''; _slash.selectedIndex = 0; _slash.range = { from: 0, to: 0 };
    if (floatingEl) floatingEl.style.display = '';
  }

  function updateSlashPopup() {
    var editor = _slash.editorRef;
    if (!editor || !editor.view.hasFocus()) { if (_slash.isOpen) removeSlashPopup(); return; }
    var data = findSlashRange(editor);
    if (data) {
      var items = filterSlashItems(data.query);
      _slash.items = items; _slash.range = data.range; _slash.query = data.query;
      if (items.length === 0 && data.query.length > 0) { removeSlashPopup(); return; }
      if (_slash.selectedIndex >= items.length) _slash.selectedIndex = Math.max(0, items.length - 1);
      showSlashPopup();
    } else {
      if (_slash.isOpen) removeSlashPopup();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZE EDITOR
  // ═══════════════════════════════════════════════════════════════
  var _extensions = [
    StarterKit,
    Placeholder.configure({ placeholder: 'Type "/" for commands, ":" for emoji...' }),
    Highlight,
    EmojiNode,
  ];
  if (Underline) _extensions.push(Underline);

  var editor = new Editor({
    element: editorEl,
    extensions: _extensions,
    content: '',
    onUpdate: function () {
      updateCharCount();
      updateBubbleState();
      updateFloatingState();
      updateSlashPopup();
      updateEmojiPopup();
      updateDomBubbleMenu();
    },
    onCreate: function () {
      updateBubbleState();
      updateFloatingState();
    },
    onSelectionUpdate: function () {
      updateBubbleState();
      updateFloatingState();
      updateDomBubbleMenu();
    },
  });

  _slash.editorRef = editor;

  // ═══════════════════════════════════════════════════════════════
  // DOM BUBBLE MENU — show inline toolbar on text selection
  // (replaces @tiptap/extension-bubble-menu CDN dependency)
  // ═══════════════════════════════════════════════════════════════
  function updateDomBubbleMenu() {
    if (!bubbleEl) return;
    var state = editor.state;
    var from = state.selection.from;
    var to = state.selection.to;
    if (from === to) {
      bubbleEl.style.display = 'none';
      return;
    }
    // Skip if selection is inside a code block
    if (editor.isActive('codeBlock')) {
      bubbleEl.style.display = 'none';
      return;
    }
    try {
      var coords = editor.view.coordsAtPos(from);
      var coordsTo = editor.view.coordsAtPos(to);
      var editorRect = editorEl.getBoundingClientRect();
      var left = ((coords.left + coordsTo.left) / 2) - editorRect.left;
      var top = coords.top - editorRect.top - bubbleEl.offsetHeight - 6;
      if (top < 0) top = coordsTo.bottom - editorRect.top + 6;
      left = Math.max(8, Math.min(left, editorRect.width - bubbleEl.offsetWidth - 8));
      bubbleEl.style.position = 'absolute';
      bubbleEl.style.left = left + 'px';
      bubbleEl.style.top = top + 'px';
      bubbleEl.style.zIndex = '1000';
      bubbleEl.style.display = 'flex';
    } catch (e) {
      bubbleEl.style.display = 'none';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DOM FLOATING MENU — show block toolbar on empty paragraph
  // (replaces @tiptap/extension-floating-menu CDN dependency)
  // ═══════════════════════════════════════════════════════════════
  function updateFloatingState() {
    if (!floatingEl) return;
    var state = editor.state;
    var $from = state.selection.$from;
    var show = !_slash.isOpen
      && editor.isActive('paragraph')
      && $from.parent.content.size === 0;
    if (!show) {
      floatingEl.style.display = 'none';
      return;
    }
    try {
      var coords = editor.view.coordsAtPos($from.pos);
      var editorRect = editorEl.getBoundingClientRect();
      var top = coords.top - editorRect.top + 2;
      floatingEl.style.position = 'absolute';
      floatingEl.style.left = '-' + (floatingEl.offsetWidth + 10) + 'px';
      floatingEl.style.top = top + 'px';
      floatingEl.style.zIndex = '999';
      floatingEl.style.display = 'flex';
    } catch (e) {
      floatingEl.style.display = 'none';
    }
  }

  // Hide DOM bubble on click outside editor
  document.addEventListener('mousedown', function (e) {
    if (bubbleEl && bubbleEl.style.display === 'flex') {
      if (!editorEl.contains(e.target) && !bubbleEl.contains(e.target)) {
        bubbleEl.style.display = 'none';
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // KEYBOARD NAVIGATION (slash + emoji popups)
  // ═══════════════════════════════════════════════════════════════
  editorEl.addEventListener('keydown', function (e) {
    if (_slash.isOpen) {
      var items = _slash.items;
      if (e.key === 'ArrowDown') { e.preventDefault(); _slash.selectedIndex = (_slash.selectedIndex + 1) % items.length; highlightSlashRows(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); _slash.selectedIndex = (_slash.selectedIndex - 1 + items.length) % items.length; highlightSlashRows(); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (items[_slash.selectedIndex]) executeSlashCommand(items[_slash.selectedIndex]); return; }
      if (e.key === 'Escape') { e.preventDefault(); removeSlashPopup(); return; }
    }
    if (_emoji.isOpen) {
      var eitems = _emoji.items;
      if (e.key === 'ArrowDown') { e.preventDefault(); _emoji.selectedIndex = (_emoji.selectedIndex + 1) % eitems.length; highlightEmojiRows(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); _emoji.selectedIndex = (_emoji.selectedIndex - 1 + eitems.length) % eitems.length; highlightEmojiRows(); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (eitems[_emoji.selectedIndex]) executeEmojiInsert(eitems[_emoji.selectedIndex]); return; }
      if (e.key === 'Escape') { e.preventDefault(); removeEmojiPopup(); return; }
    }
  });

  document.addEventListener('mousedown', function (e) {
    if (_slash.isOpen && _slash.popupEl && !_slash.popupEl.contains(e.target)) {
      if (!editorEl.contains(e.target)) removeSlashPopup();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // CHARACTER COUNTER
  // ═══════════════════════════════════════════════════════════════
  var charCounter = document.getElementById('charCounter');
  function updateCharCount() {
    if (!charCounter) return;
    var text = editor.getText();
    var len = text.replace(/\n/g, '').length;
    charCounter.textContent = len;
    if (len > 500) charCounter.classList.add('over-limit');
    else charCounter.classList.remove('over-limit');
  }

  // ═══════════════════════════════════════════════════════════════
  // BUBBLE MENU BUTTONS
  // ═══════════════════════════════════════════════════════════════
  var headingDropdownEl = document.getElementById('headingDropdown');
  var headingToggleBtn = bubbleEl ? bubbleEl.querySelector('.bm-heading-toggle') : null;
  var headingLabelEl = bubbleEl ? bubbleEl.querySelector('.bm-heading-label') : null;
  var _headingDropdownOpen = false;

  function getCurrentHeadingLabel() {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'Aa';
  }

  function updateHeadingLabel() {
    if (!headingLabelEl) return;
    headingLabelEl.textContent = getCurrentHeadingLabel();
  }

  function openHeadingDropdown() {
    if (!headingDropdownEl || !headingToggleBtn) return;
    var bubbleRect = bubbleEl.getBoundingClientRect();
    headingDropdownEl.style.position = 'fixed';
    headingDropdownEl.style.left = bubbleRect.left + 'px';
    headingDropdownEl.style.top = (bubbleRect.bottom + 4) + 'px';
    headingDropdownEl.style.display = 'block';
    headingToggleBtn.setAttribute('aria-expanded', 'true');
    _headingDropdownOpen = true;
    updateHeadingDropdownState();
  }

  function closeHeadingDropdown() {
    if (!headingDropdownEl || !headingToggleBtn) return;
    headingDropdownEl.style.display = 'none';
    headingToggleBtn.setAttribute('aria-expanded', 'false');
    _headingDropdownOpen = false;
  }

  function toggleHeadingDropdown() {
    if (_headingDropdownOpen) closeHeadingDropdown(); else openHeadingDropdown();
  }

  function updateHeadingDropdownState() {
    if (!headingDropdownEl) return;
    var items = headingDropdownEl.querySelectorAll('.hd-item');
    items.forEach(function (item) {
      var type = item.getAttribute('data-hd');
      var isActive = false;
      switch (type) {
        case 'paragraph': isActive = editor.isActive('paragraph') && !editor.isActive('heading'); break;
        case 'heading1': isActive = editor.isActive('heading', { level: 1 }); break;
        case 'heading2': isActive = editor.isActive('heading', { level: 2 }); break;
        case 'heading3': isActive = editor.isActive('heading', { level: 3 }); break;
      }
      item.classList.toggle('is-active', isActive);
    });
  }

  if (headingDropdownEl) {
    var hdItems = headingDropdownEl.querySelectorAll('.hd-item');
    hdItems.forEach(function (item) {
      item.addEventListener('mousedown', function (e) {
        e.preventDefault(); e.stopPropagation();
        var type = item.getAttribute('data-hd');
        var chain = editor.chain().focus();
        switch (type) {
          case 'paragraph': chain.setParagraph().run(); break;
          case 'heading1': chain.setHeading({ level: 1 }).run(); break;
          case 'heading2': chain.setHeading({ level: 2 }).run(); break;
          case 'heading3': chain.setHeading({ level: 3 }).run(); break;
        }
        closeHeadingDropdown();
        updateBubbleState();
      });
    });
  }

  document.addEventListener('mousedown', function (e) {
    if (_headingDropdownOpen && headingDropdownEl) {
      if (!headingDropdownEl.contains(e.target) && !headingToggleBtn.contains(e.target)) {
        closeHeadingDropdown();
      }
    }
  });

  var bmBtns = bubbleEl ? bubbleEl.querySelectorAll('[data-bm]') : [];
  bmBtns.forEach(function (btn) {
    btn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var action = btn.getAttribute('data-bm');
      if (action === 'heading') { toggleHeadingDropdown(); return; }
      var chain = editor.chain().focus();
      switch (action) {
        case 'bold': chain.toggleBold().run(); break;
        case 'italic': chain.toggleItalic().run(); break;
        case 'strike': chain.toggleStrike().run(); break;
        case 'underline': chain.toggleUnderline().run(); break;
        case 'code': chain.toggleCode().run(); break;
        case 'highlight': chain.toggleHighlight({ color: '#ffc078' }).run(); break;
        case 'link':
          if (editor.isActive('link')) {
            chain.unsetLink().run();
          } else {
            var url = window.prompt ? prompt('Enter URL:') : null;
            if (url) chain.setLink({ href: url }).run();
          }
          break;
      }
      closeHeadingDropdown();
      updateBubbleState();
    });
  });

  function updateBubbleState() {
    bmBtns.forEach(function (btn) {
      var action = btn.getAttribute('data-bm');
      if (!action || action === 'heading') return;
      var isActive = false;
      switch (action) {
        case 'bold': isActive = editor.isActive('bold'); break;
        case 'italic': isActive = editor.isActive('italic'); break;
        case 'strike': isActive = editor.isActive('strike'); break;
        case 'underline': isActive = editor.isActive('underline'); break;
        case 'code': isActive = editor.isActive('code'); break;
        case 'highlight': isActive = editor.isActive('highlight'); break;
        case 'link': isActive = editor.isActive('link'); break;
      }
      btn.classList.toggle('is-active', isActive);
    });
    updateHeadingLabel();
  }

  // ═══════════════════════════════════════════════════════════════
  // FLOATING MENU BUTTONS
  // ═══════════════════════════════════════════════════════════════
  var fmBtns = floatingEl ? floatingEl.querySelectorAll('[data-fm]') : [];
  fmBtns.forEach(function (btn) {
    btn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var action = btn.getAttribute('data-fm');
      var chain = editor.chain().focus();
      switch (action) {
        case 'heading1': chain.toggleHeading({ level: 1 }).run(); break;
        case 'heading2': chain.toggleHeading({ level: 2 }).run(); break;
        case 'heading3': chain.toggleHeading({ level: 3 }).run(); break;
        case 'bulletList': chain.toggleBulletList().run(); break;
        case 'orderedList': chain.toggleOrderedList().run(); break;
        case 'blockquote': chain.toggleBlockquote().run(); break;
        case 'codeBlock': chain.toggleCodeBlock().run(); break;
        case 'horizontalRule': chain.setHorizontalRule().run(); break;
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // STAR RATING PICKER
  // ═══════════════════════════════════════════════════════════════
  var allStarPickers = document.querySelectorAll('.compose-rating-picker');
  allStarPickers.forEach(function (picker) {
    var stars = picker.querySelectorAll('.rate-star');
    stars.forEach(function (star) {
      star.addEventListener('mouseenter', function () {
        var val = parseInt(star.getAttribute('data-val'));
        stars.forEach(function (s) {
          s.textContent = parseInt(s.getAttribute('data-val')) <= val ? '\u2605' : '\u2606';
        });
      });
    });
    picker.addEventListener('mouseleave', function () {
      var activeVal = picker.getAttribute('data-rating') || 0;
      stars.forEach(function (s) {
        s.textContent = parseInt(s.getAttribute('data-val')) <= parseInt(activeVal) ? '\u2605' : '\u2606';
      });
    });
    stars.forEach(function (star) {
      star.addEventListener('click', function () {
        var val = parseInt(star.getAttribute('data-val'));
        picker.setAttribute('data-rating', val);
        stars.forEach(function (s) {
          var sv = parseInt(s.getAttribute('data-val'));
          s.classList.toggle('active', sv <= val);
          s.textContent = sv <= val ? '\u2605' : '\u2606';
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════════════════════════
  var submitBtn = document.getElementById('composeSubmitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var text = editor.getText().trim();
      if (!text) return;
      var isCommunity = document.body.querySelector('.community-toast') || document.body.querySelector('.post-reply-editor');
      showToast(isCommunity ? 'Reply posted!' : 'Review submitted successfully!');
      editor.commands.clearContent();
      if (charCounter) {
        charCounter.textContent = '0';
        charCounter.classList.remove('over-limit');
      }
      var mainPicker = document.querySelector('.compose-rating-picker');
      if (mainPicker) {
        mainPicker.removeAttribute('data-rating');
        mainPicker.querySelectorAll('.rate-star').forEach(function (s) {
          s.classList.remove('active');
          s.textContent = '\u2606';
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════════════
  function showToast(message) {
    var existing = document.querySelector('.review-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    // Use community-toast class if on community page, else review-toast
    var isCommunity = document.body.querySelector('.community-toast') || document.body.querySelector('.post-reply-editor');
    toast.className = isCommunity ? 'community-toast' : 'review-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════
  window.__tiptapEditor = editor;

  // ── Export reply tools for inline reply editors (prompt-detail) ──
  window.__replyEditorTools = {
    Editor: Editor,
    StarterKit: StarterKit,
    Placeholder: Placeholder,
    Underline: Underline,
    Highlight: Highlight,
    EmojiNode: EmojiNode,
    slashItems: slashItems,
    emojiList: emojiList,
    attachHandlers: function (editor, hostEl) {
      if (!editor || !hostEl) return;

      var state = {
        slash: { isOpen: false, query: '', selectedIndex: 0, items: [], range: { from: 0, to: 0 }, popupEl: null },
        emoji: { isOpen: false, query: '', selectedIndex: 0, items: [], range: { from: 0, to: 0 }, popupEl: null },
      };

      function findSlashRange(ed) {
        try {
          var st = ed.state;
          var $from = st.selection.$from;
          var textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
          var match = textBefore.match(/\/([a-zA-Z0-9]*)$/);
          if (match) {
            var matchLen = match[0].length;
            return { query: match[1], range: { from: $from.pos - matchLen, to: $from.pos } };
          }
        } catch (e) {}
        return null;
      }

      function filterSlash(q) {
        if (!q) return slashItems.slice();
        var ql = q.toLowerCase();
        return slashItems.filter(function (i) {
          return i.title.toLowerCase().indexOf(ql) !== -1 || i.desc.toLowerCase().indexOf(ql) !== -1;
        });
      }

      function buildSlashPopup() {
        var popup = document.createElement('div');
        popup.className = 'slash-command-popup';
        var items = state.slash.items;
        if (items.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'slash-empty';
          empty.textContent = 'No results';
          popup.appendChild(empty);
          return popup;
        }
        var sections = {};
        items.forEach(function (item) { if (!sections[item.section]) sections[item.section] = []; sections[item.section].push(item); });
        Object.keys(sections).forEach(function (name) {
          var header = document.createElement('div');
          header.className = 'slash-section-header';
          header.textContent = name;
          popup.appendChild(header);
          sections[name].forEach(function (item) {
            var globalIdx = state.slash.items.indexOf(item);
            var row = document.createElement('div');
            row.className = 'slash-item' + (globalIdx === state.slash.selectedIndex ? ' is-selected' : '');
            var icon = document.createElement('span');
            icon.className = 'slash-item-icon';
            icon.textContent = item.icon;
            var text = document.createElement('span');
            text.className = 'slash-item-text';
            text.textContent = item.title;
            var desc = document.createElement('span');
            desc.className = 'slash-item-desc';
            desc.textContent = item.desc;
            row.appendChild(icon); row.appendChild(text); row.appendChild(desc);
            row.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); executeSlash(item); });
            row.addEventListener('mouseenter', function () { state.slash.selectedIndex = globalIdx; highlightSlashRows(); });
            popup.appendChild(row);
          });
        });
        return popup;
      }

      function highlightSlashRows() {
        if (!state.slash.popupEl) return;
        var rows = state.slash.popupEl.querySelectorAll('.slash-item');
        rows.forEach(function (r, i) {
          r.classList.toggle('is-selected', i === state.slash.selectedIndex);
          if (i === state.slash.selectedIndex) r.scrollIntoView({ block: 'nearest' });
        });
      }

      function posPopup(popup, range) {
        try {
          var coords = editor.view.coordsAtPos(range.from);
          var hostRect = hostEl.getBoundingClientRect();
          var left = Math.max(0, Math.min(coords.left - hostRect.left, hostRect.width - 280));
          var top = coords.bottom - hostRect.top + 4;
          popup.style.position = 'absolute';
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
          popup.style.zIndex = '1001';
          hostEl.parentElement.style.position = 'relative';
          hostEl.parentElement.appendChild(popup);
        } catch (e) {
          popup.style.position = 'absolute';
          popup.style.left = '0';
          popup.style.top = '100%';
          popup.style.zIndex = '1001';
          hostEl.parentElement.appendChild(popup);
        }
      }

      function removeSlashPopup() {
        if (state.slash.popupEl) { if (state.slash.popupEl.parentNode) state.slash.popupEl.remove(); state.slash.popupEl = null; }
        state.slash.isOpen = false; state.slash.query = ''; state.slash.selectedIndex = 0;
      }

      function executeSlash(item) {
        var range = { from: state.slash.range.from, to: state.slash.range.to };
        removeSlashPopup();
        var chain = editor.chain().focus().deleteRange(range);
        switch (item.cmd) {
          case 'paragraph': chain.setParagraph().run(); break;
          case 'heading1': chain.setHeading({ level: 1 }).run(); break;
          case 'heading2': chain.setHeading({ level: 2 }).run(); break;
          case 'heading3': chain.setHeading({ level: 3 }).run(); break;
          case 'bulletList': chain.setBulletList().run(); break;
          case 'orderedList': chain.setOrderedList().run(); break;
          case 'blockquote': chain.setBlockquote().run(); break;
          case 'codeBlock': chain.setCodeBlock().run(); break;
          case 'divider': chain.setHorizontalRule().run(); break;
          case 'bold': chain.toggleBold().run(); break;
          case 'italic': chain.toggleItalic().run(); break;
          case 'underline': chain.toggleUnderline().run(); break;
          case 'strike': chain.toggleStrike().run(); break;
          case 'code': chain.toggleCode().run(); break;
        }
        state.slash.query = ''; state.slash.selectedIndex = 0; state.slash.range = { from: 0, to: 0 };
      }

      function updateSlashPopup() {
        if (!editor || !editor.view.hasFocus()) { if (state.slash.isOpen) removeSlashPopup(); return; }
        if (state.emoji.isOpen) return;
        var data = findSlashRange(editor);
        if (data) {
          var items = filterSlash(data.query);
          state.slash.items = items; state.slash.range = data.range; state.slash.query = data.query;
          if (items.length === 0 && data.query.length > 0) { removeSlashPopup(); return; }
          if (state.slash.selectedIndex >= items.length) state.slash.selectedIndex = Math.max(0, items.length - 1);
          removeSlashPopup();
          var popup = buildSlashPopup();
          state.slash.popupEl = popup;
          posPopup(popup, data.range);
          state.slash.isOpen = true;
        } else {
          if (state.slash.isOpen) removeSlashPopup();
        }
      }

      function findEmojiRange(ed) {
        try {
          var st = ed.state;
          var $from = st.selection.$from;
          var textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
          var match = textBefore.match(/:([a-z_0-9]*)$/);
          if (match) {
            var matchLen = match[0].length;
            return { query: match[1], range: { from: $from.pos - matchLen, to: $from.pos } };
          }
        } catch (e) {}
        return null;
      }

      function filterEmojis(q) {
        if (!q) return emojiList.slice(0, 20);
        var ql = q.toLowerCase();
        return emojiList.filter(function (e) { return e.name.toLowerCase().indexOf(ql) !== -1; }).slice(0, 20);
      }

      function buildEmojiPopup() {
        var popup = document.createElement('div');
        popup.className = 'emoji-popup';
        var items = state.emoji.items;
        if (items.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'emoji-empty';
          empty.textContent = 'No matching emoji';
          popup.appendChild(empty);
          return popup;
        }
        items.forEach(function (item, idx) {
          var row = document.createElement('div');
          row.className = 'emoji-item' + (idx === state.emoji.selectedIndex ? ' is-selected' : '');
          var glyph = document.createElement('span');
          glyph.className = 'emoji-item-glyph';
          glyph.textContent = item.emoji;
          var name = document.createElement('span');
          name.className = 'emoji-item-name';
          name.textContent = ':' + item.name + ':';
          row.appendChild(glyph); row.appendChild(name);
          row.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); executeEmoji(item); });
          row.addEventListener('mouseenter', function () { state.emoji.selectedIndex = idx; highlightEmojiRows(); });
          popup.appendChild(row);
        });
        return popup;
      }

      function highlightEmojiRows() {
        if (!state.emoji.popupEl) return;
        var rows = state.emoji.popupEl.querySelectorAll('.emoji-item');
        rows.forEach(function (r, i) { r.classList.toggle('is-selected', i === state.emoji.selectedIndex); });
      }

      function removeEmojiPopup() {
        if (state.emoji.popupEl) { if (state.emoji.popupEl.parentNode) state.emoji.popupEl.remove(); state.emoji.popupEl = null; }
        state.emoji.isOpen = false; state.emoji.query = ''; state.emoji.selectedIndex = 0;
      }

      function executeEmoji(item) {
        var range = { from: state.emoji.range.from, to: state.emoji.range.to };
        removeEmojiPopup();
        editor.chain().focus().deleteRange(range).insertContent({ type: 'emoji', attrs: { name: item.name, emoji: item.emoji } }).run();
        state.emoji.query = ''; state.emoji.selectedIndex = 0; state.emoji.range = { from: 0, to: 0 };
      }

      function updateEmojiPopup() {
        if (!editor || !editor.view.hasFocus() || state.slash.isOpen) { if (state.emoji.isOpen) removeEmojiPopup(); return; }
        var data = findEmojiRange(editor);
        if (data) {
          var items = filterEmojis(data.query);
          state.emoji.items = items; state.emoji.range = data.range; state.emoji.query = data.query;
          if (items.length === 0 && data.query.length > 1) { removeEmojiPopup(); return; }
          if (state.emoji.selectedIndex >= items.length) state.emoji.selectedIndex = Math.max(0, items.length - 1);
          removeEmojiPopup();
          var popup = buildEmojiPopup();
          state.emoji.popupEl = popup;
          posPopup(popup, data.range);
          state.emoji.isOpen = true;
        } else {
          if (state.emoji.isOpen) removeEmojiPopup();
        }
      }

      hostEl.addEventListener('keydown', function (e) {
        if (state.slash.isOpen) {
          var sItems = state.slash.items;
          if (e.key === 'ArrowDown') { e.preventDefault(); state.slash.selectedIndex = (state.slash.selectedIndex + 1) % sItems.length; highlightSlashRows(); return; }
          if (e.key === 'ArrowUp') { e.preventDefault(); state.slash.selectedIndex = (state.slash.selectedIndex - 1 + sItems.length) % sItems.length; highlightSlashRows(); return; }
          if (e.key === 'Enter') { e.preventDefault(); if (sItems[state.slash.selectedIndex]) executeSlash(sItems[state.slash.selectedIndex]); return; }
          if (e.key === 'Escape') { e.preventDefault(); removeSlashPopup(); return; }
        }
        if (state.emoji.isOpen) {
          var eItems = state.emoji.items;
          if (e.key === 'ArrowDown') { e.preventDefault(); state.emoji.selectedIndex = (state.emoji.selectedIndex + 1) % eItems.length; highlightEmojiRows(); return; }
          if (e.key === 'ArrowUp') { e.preventDefault(); state.emoji.selectedIndex = (state.emoji.selectedIndex - 1 + eItems.length) % eItems.length; highlightEmojiRows(); return; }
          if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (eItems[state.emoji.selectedIndex]) executeEmoji(eItems[state.emoji.selectedIndex]); return; }
          if (e.key === 'Escape') { e.preventDefault(); removeEmojiPopup(); return; }
        }
      });

      editor.on('update', function () { updateSlashPopup(); updateEmojiPopup(); });
      editor.on('selectionUpdate', function () {
        if (!editor.view.hasFocus()) {
          if (state.slash.isOpen) removeSlashPopup();
          if (state.emoji.isOpen) removeEmojiPopup();
        }
      });

      document.addEventListener('mousedown', function (e) {
        if (state.slash.isOpen && state.slash.popupEl && !state.slash.popupEl.contains(e.target)) {
          if (!hostEl.contains(e.target)) removeSlashPopup();
        }
        if (state.emoji.isOpen && state.emoji.popupEl && !state.emoji.popupEl.contains(e.target)) {
          if (!hostEl.contains(e.target)) removeEmojiPopup();
        }
      });
    }
  };

  // Resolve deferred promise (prompt.js awaits this)
  if (window.__replyToolsDeferred && window.__replyToolsDeferred.resolve) {
    window.__replyToolsDeferred.resolve(window.__replyEditorTools);
  }
})();
