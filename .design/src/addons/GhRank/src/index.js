// Tiptap editor entry - exports all needed modules for the review editor
import { Editor, Node, Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// Re-export for UMD bundle
window.TiptapEditor = {
  Editor,
  Node,
  Mark,
  mergeAttributes,
  StarterKit,
  Placeholder,
  createEditor: function(options) {
    return new Editor(options);
  }
};
