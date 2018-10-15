(function () {
    "use strict";
    var cells,
        tabletools,
        getSelectedCells;

    CKEDITOR.plugins.add('cellselection',
        {
            onLoad: function () {
                // We can't alias these features earlier, as they could be still not loaded.
                tabletools = CKEDITOR.plugins.tabletools;
                getSelectedCells = tabletools.getSelectedCells;
            },
        });

    CKEDITOR.on('dialogDefinition', function (ev) {
        var dialogName = ev.data.name,
            dialogDefinition = ev.data.definition,
            editor = ev.editor,
            tabName = '';

        if (dialogName === 'cellProperties') {
            tabName = 'info';
            dialogDefinition.minHeight += 80;
        }

        if (tabName === '')
            return;

        var tab = dialogDefinition.getContents(tabName);

        if (!tab)
            return;

        var select = {
            type: 'select',
            id: 'cellSelection',
            default: 'cell',
            items: [
                [editor.lang.cellselection.cell, 'cell'],
                [editor.lang.cellselection.row, 'row'],
                [editor.lang.cellselection.col, 'col'],
                [editor.lang.cellselection.all, 'all']
            ],
            setup: function() {
                var select = this.getElement();

                cells = getSelectedCells(editor.getSelection());

                if (cells.length === 1) {
                    cells = cells.shift();

                    select.setStyle('display', '')
                } else {
                    select.setStyle('display', 'none')
                }
            },
            onChange: function (event) {
                var value = event.data.value;
                var elems = getBlocks(cells, value);
                var dialog = CKEDITOR.dialog.getCurrent();

                if (elems) {
                    selectCells(editor, elems);

                    dialog.cells = getSelectedCells(editor.getSelection());
                }
            }
        };

        tab.elements.unshift(select);
    }, null, null, 9);

    // English
    addTranslation('en', {
        cell: 'Update current cell',
        row: 'Update all cells in row',
        col: 'Update all cells in column',
        all: 'Update all cells in table'
    });

    // Deutsch
    addTranslation('de', {
        cell: 'Diese Zelle ver\u00e4ndern',
        row: 'Alle Zellen in dieser Zeile ver\u00e4ndern',
        col: 'Alle Zellen in einer Kolonne ver\u00e4ndern',
        all: 'Alle Zellen der Tabelle ver\u00e4ndern'
    });

    // Russian
    addTranslation('ru', {
        cell: "Обновить текущую ячейку",
        row: "Обновить все ячейки в строке",
        col: "Обновить текущую в столбце",
        all: "Обновить все ячейки в таблице",
    });

    function getBlocks(cell, param) {
        var blocks = cell;
        var table, index;

        if (Array.isArray(cell)) {
            return null;
        }

        table = cell.getAscendant('table');
        index = cell.getIndex();

        switch (param) {
            case 'row':
                blocks = cell.getParent().getChildren();
                break;
            case 'col':
                blocks = table.find('td:nth-child(' + (index + 1) + ')');
                break;
            case 'all':
                blocks = table.find('td');
                break;
        }

        return blocks;
    }

    function addTranslation(lang, texts) {
        CKEDITOR.plugins.setLang('cellselection', lang, texts);
    }

    function selectCells(editor, cells) {
        var ranges = [],
            item,
            i;

        if (cells.$ instanceof HTMLElement) {
            ranges.push(getRange(editor, cells));
        } else {
            for (i = 0; i < cells.count(); i++) {
                item = cells.getItem(i);

                ranges.push(getRange(editor, item));
            }
        }

        editor.getSelection().selectRanges(ranges);
    }

    function getRange(editor, item) {
        var range = editor.createRange();

        range.setStartBefore(item);
        range.setEndAfter(item);

        return range;
    }
})();
