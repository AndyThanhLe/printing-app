document.getElementById('stl-import').addEventListener('click', () => { document.getElementById('file-submission').click(); });
document.getElementById('file-submission').addEventListener('change', () => { document.getElementById('import-form').submit();  });
