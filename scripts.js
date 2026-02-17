// === CONFIG ===
const TARGET_SNPS = [ /* same array as before — I kept it identical */ 
    { rsid: "rs4988235", locus: "LCT", ea: "A", ref: "G", effect: "Lactase persistence", note: "↓ B. adolescentis" },
    { rsid: "rs182549", locus: "LCT", ea: "T", ref: "C", effect: "Lactase persistence tag", note: "Perfect proxy" },
    { rsid: "rs4556017", locus: "MUC12", ea: "T", ref: "C", effect: "↑ Coprobacillus cateniformis", note: "Hemorrhoidal link" },
    { rsid: "rs550057", locus: "ABO", ea: "T", ref: "C", effect: "↑ M. torques", note: "" },
    { rsid: "rs9411378", locus: "ABO", ea: "A", ref: "C", effect: "↑ M. torques (strongest)", note: "" },
    { rsid: "rs28407950", locus: "HLA-DQB1", ea: "T", ref: "C", effect: "↑ Agathobacter", note: "↓ celiac risk" },
    { rsid: "rs2287921", locus: "FUT2", ea: "C", ref: "T", effect: "Non-secretor tag", note: "" },
    { rsid: "rs601338", locus: "FUT2", ea: "A", ref: "G", effect: "Non-secretor (stop codon)", note: "Functional key variant" },
    { rsid: "rs681343", locus: "FUT2", ea: "T", ref: "C", effect: "Non-secretor tag", note: "" },
    { rsid: "rs17007949", locus: "FOXP1", ea: "C", ref: "G", effect: "↑ Intestinibacter", note: "Novel 2026" },
    { rsid: "rs4785960", locus: "CORO7–HMOX2", ea: "C", ref: "G", effect: "↓ Turicibacter", note: "Bile acids & WHR" },
    { rsid: "rs8182173", locus: "CORO7–HMOX2", ea: "T", ref: "C", effect: "↓ C. saudiense", note: "" },
    { rsid: "rs708686", locus: "FUT3–FUT6", ea: "T", ref: "C", effect: "Lewis antigen effect", note: "" }
];

// === THEME ===
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function setTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = '🌙';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = '☀️';
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    const isDark = !document.documentElement.classList.contains('dark');
    setTheme(isDark);
});

if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme(true);
} else {
    setTheme(false);
}

// === FILE PROCESSING & TABLE (same robust parser as before) ===
const fileInput = document.getElementById('fileInput');
const statusEl = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const tableEl = document.getElementById('resultsTable');
const synopsisEl = document.getElementById('synopsis');
const exportBtn = document.getElementById('exportBtn');

function parse23andMe(text) {
    const map = {};
    text.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const [rsid, , , genotype] = line.split('\t');
        if (rsid && rsid.startsWith('rs') && genotype) map[rsid] = genotype;
    });
    return map;
}

function generateSynopsis(geno) {
    let html = `<p class="font-medium">Your key genetic profile for gut microbiota:</p><ul class="list-disc pl-5 space-y-2 mt-4">`;
    if (geno['rs4988235'] === 'CC' || geno['rs182549'] === 'CC') html += `<li><strong>Lactase non-persistent</strong> → higher predicted <em>Bifidobacterium adolescentis</em> with dairy intake.</li>`;
    if (geno['rs601338'] === 'GG') html += `<li><strong>Secretor</strong> (normal fucosylated mucins).</li>`;
    else if (geno['rs601338'] === 'AA' || geno['rs601338'] === 'AG') html += `<li><strong>Non-secretor</strong> → altered mucin glycosylation affecting multiple species.</li>`;
    if (geno['rs4556017'] === 'CC') html += `<li>Protective MUC12 genotype.</li>`;
    if (geno['rs4785960'] === 'GG') html += `<li>CORO7–HMOX2 genotype linked to lower <em>Turicibacter</em>.</li>`;
    html += `</ul><p class="text-xs text-gray-500 dark:text-gray-400 mt-6">Small-effect associations only. Diet and lifestyle dominate.</p>`;
    return html;
}

function exportCSV(genotypes) {
    let csv = "rsID,Locus,Your Genotype,Effect Allele,EA Count,Predicted Effect,Notes\n";
    TARGET_SNPS.forEach(s => {
        const gt = genotypes[s.rsid] || "Not genotyped";
        let count = 0;
        if (typeof gt === "string" && gt.length === 2) {
            count = (gt[0] === s.ea ? 1 : 0) + (gt[1] === s.ea ? 1 : 0);
        }
        csv += `"${s.rsid}","${s.locus}","${gt}","${s.ea}","${count}","${s.effect}","${s.note || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-gut-gwas-results.csv';
    a.click();
    URL.revokeObjectURL(url);
}

fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    statusEl.textContent = 'Reading file...';
    const reader = new FileReader();
    reader.onload = ev => {
        const genotypes = parse23andMe(ev.target.result);
        statusEl.textContent = `Processed ${Object.keys(genotypes).length} variants ✓`;

        // Build table
        let html = `<thead><tr><th>rsID</th><th>Locus</th><th>Your Genotype</th><th>Effect Allele</th><th>EA Count</th><th>Predicted Shift</th><th>Notes</th></tr></thead><tbody>`;
        TARGET_SNPS.forEach(s => {
            const gt = genotypes[s.rsid] || '<span class="text-gray-400">Not genotyped</span>';
            let count = 0;
            if (typeof gt === "string" && gt.length === 2) count = (gt[0]===s.ea?1:0) + (gt[1]===s.ea?1:0);
            html += `<tr><td class="font-mono">${s.rsid}</td><td>${s.locus}</td><td class="font-medium">${gt}</td><td>${s.ea} (ref ${s.ref})</td><td class="text-center">${count}</td><td class="text-sm">${s.effect}</td><td class="text-xs text-gray-500">${s.note||''}</td></tr>`;
        });
        html += `</tbody>`;
        tableEl.innerHTML = html;

        synopsisEl.innerHTML = generateSynopsis(genotypes);
        resultsDiv.classList.remove('hidden');

        // Export button
        exportBtn.onclick = () => exportCSV(genotypes);
    };
    reader.readAsText(file);
});