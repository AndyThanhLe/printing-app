document.getElementById('stl-import').addEventListener('click', () => { document.getElementById('file-submission').click(); });
document.getElementById('file-submission').addEventListener('change', submitFile);

function submitFile() {
    if (document.getElementById('file-submission').files.length > 0) {
        document.getElementById('import-form').submit();
    }
}


