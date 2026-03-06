export function renderRichText(source: string): string {
    const escaped = String(source || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const formatted = escaped
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, url) => `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`)
        .replace(/\n/g, '<br>');

    return formatted;
}
