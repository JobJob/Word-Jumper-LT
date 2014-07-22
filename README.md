Word Jumper for Light Table
===========================

Word jumper is a Code Mirror plugin that allows you to jump into camelCase, under_scored words with a simple keyboard shortcut (pmeta-alt-right/left by default) (https://github.com/ajile/word-jumper)

This is a plugin to enable that functionality within Light Table.

It uses a slightly modified version of ajile's aforementioned Code Mirror plugin, so props to him.

To change your keyboard shortcuts alter the :editor map in your user.keymap file as follows. This example uses ctrl instead of pmeta-alt.

    {:+ {:editor {"ctrl-right" [(:editor.codemirror.command "wjright")]
                  "ctrl-left" [(:editor.codemirror.command "wjleft")]
                  "ctrl-shift-right" [(:editor.codemirror.command "wjsright")]
                  "ctrl-shift-left" [(:editor.codemirror.command "wjsleft")]}}}

