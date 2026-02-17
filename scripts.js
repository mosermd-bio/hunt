// === CONFIG - Rich Educational Interpretations ===
const TARGET_SNPS = [
    { 
        rsid: "rs4988235", 
        locus: "LCT", 
        ea: "A", 
        ref: "G", 
        effect: "Lactase persistence", 
        note: "↓ B. adolescentis",
        interpretation: "The A allele keeps the LCT gene active in adults (lactase persistence). Lactose is digested in the small intestine instead of reaching the colon, leading to lower abundance of the lactose-fermenting bacterium Bifidobacterium adolescentis."
    },
    { 
        rsid: "rs182549", 
        locus: "LCT", 
        ea: "T", 
        ref: "C", 
        effect: "Lactase persistence tag", 
        note: "Perfect proxy",
        interpretation: "Strong proxy (r² > 0.99) for the main lactase-persistence SNP. Same biological effect on Bifidobacterium adolescentis abundance."
    },
    { 
        rsid: "rs4556017", 
        locus: "MUC12", 
        ea: "T", 
        ref: "C", 
        effect: "↑ Coprobacillus cateniformis", 
        note: "Hemorrhoidal link",
        interpretation: "Variant in the MUC12 mucin gene expressed in the colon. The T allele increases Coprobacillus cateniformis abundance and colocalizes with reduced risk of hemorrhoidal disease via effects on the protective mucus layer."
    },
    { 
        rsid: "rs550057", 
        locus: "ABO", 
        ea: "T", 
        ref: "C", 
        effect: "↑ M. torques & related", 
        note: "",
        interpretation: "Blood-group antigen variant. Modifies ABO antigens on gut mucosal glycans, which serve as binding sites and carbon sources for specific bacteria such as Mediterraneibacter torques."
    },
    { 
        rsid: "rs9411378", 
        locus: "ABO", 
        ea: "A", 
        ref: "C", 
        effect: "↑ M. torques (strongest)", 
        note: "",
        interpretation: "Strongest ABO signal in the Swedish data. Affects gut surface glycans that influence colonization by mucin-degrading bacteria."
    },
    { 
        rsid: "rs28407950", 
        locus: "HLA-DQB1", 
        ea: "T", 
        ref: "C", 
        effect: "↑ Agathobacter", 
        note: "↓ celiac risk",
        interpretation: "HLA class II variant strongly linked to autoimmune risk. The T allele is associated with higher Agathobacter abundance and reduced celiac disease risk, suggesting a microbiota-mediated protective effect."
    },
    { 
        rsid: "rs2287921", 
        locus: "FUT2", 
        ea: "C", 
        ref: "T", 
        effect: "Non-secretor tag", 
        note: "",
        interpretation: "Tag SNP for FUT2 secretor status. Determines whether fucosylated glycans are present in intestinal mucus — a major carbon source and attachment site for many gut bacteria."
    },
    { 
        rsid: "rs601338", 
        locus: "FUT2", 
        ea: "A", 
        ref: "G", 
        effect: "Non-secretor (stop codon)", 
        note: "Functional key variant",
        interpretation: "Functional stop-gain variant that determines secretor vs non-secretor status. Secretors (G allele) produce fucosylated mucins, strongly shaping abundance of Clostridium and Blautia species."
    },
    { 
        rsid: "rs681343", 
        locus: "FUT2", 
        ea: "T", 
        ref: "C", 
        effect: "Non-secretor tag", 
        note: "",
        interpretation: "Common tag for FUT2 secretor status. Non-secretors lack fucosylated glycans in mucus, altering the gut environment for multiple bacterial species."
    },
    { 
        rsid: "rs17007949", 
        locus: "FOXP1", 
        ea: "C", 
        ref: "G", 
        effect: "↑ Intestinibacter", 
        note: "Novel 2026",
        interpretation: "Novel locus identified in 2026. Associated with Intestinibacter species and shares genetic signals with bile-acid metabolism and body-composition traits."
    },
    { 
        rsid: "rs4785960", 
        locus: "CORO7–HMOX2", 
        ea: "C", 
        ref: "G", 
        effect: "↓ Turicibacter", 
        note: "Bile acids & WHR",
        interpretation: "Novel 2026 locus. The C allele lowers Turicibacter sanguinis abundance. Linked to secondary bile-acid levels and waist-hip ratio, connecting host lipid metabolism and the gut microbiota."
    },
    { 
        rsid: "rs8182173", 
        locus: "CORO7–HMOX2", 
        ea: "T", 
        ref: "C", 
        effect: "↓ C. saudiense", 
        note: "",
        interpretation: "Part of the same novel CORO7–HMOX2 locus. Associated with reduced Clostridium saudiense and bile-acid metabolism."
    },
    { 
        rsid: "rs708686", 
        locus: "FUT3–FUT6", 
        ea: "T", 
        ref: "C", 
        effect: "Lewis antigen effect", 
        note: "",
        interpretation: "Lewis blood-group locus. Influences fucosyltransferase activity and has been linked to Clostridium species abundance as well as LDL cholesterol levels."
    }
];

// === THEME (unchanged) ===
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

// === FILE PROCESSING ===
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
    let html = `<p class="font-medium">Your personalized genetic profile summary:</p><ul class="list-disc pl-5 space-y-2 mt-4">`;
    
    if (geno['rs4988235'] === 'CC' || geno['rs182549'] === 'CC') {
        html += `<li><strong>Lactase non-persistent</strong> — higher predicted <em>Bifidobacterium adolescentis</em> when consuming dairy.</li>`;
    } else if ((geno['rs4988235'] && geno['rs4988235'].includes('A')) || (geno['rs182549'] && geno['rs182549'].includes('T'))) {
        html += `<li><strong>Lactase persistent</strong> — lower <em>Bifidobacterium adolescentis</em> abundance.</li>`;
    }
    
    if (geno['rs601338'] === 'GG') {
        html += `<li><strong>FUT2 Secretor</strong> — normal fucosylated mucin production in the gut.</li>`;
    } else if (geno['rs601338'] === 'AA' || geno['rs601338'] === 'AG') {
        html += `<li><strong>FUT2 Non-secretor</strong> — altered mucus glycans affecting several bacterial species.</li>`;
    }
    
    if (geno['rs4556017'] === 'CC') html += `<li>Protective MUC12 genotype associated with higher <em>Coprobacillus cateniformis</em>.</li>`;
    if (geno['rs28407950'] === 'CC') html += `<li>Protective HLA-DQB1 genotype associated with higher <em>Agathobacter</em>.</li>`;
    if (geno['rs4785960'] === 'GG') html += `<li>CORO7–HMOX2 genotype linked to lower <em>Turicibacter</em> abundance (bile-acid link).</li>`;
    
    html += `</ul><p class="text-xs text-gray-500 dark:text-gray-400 mt-6">These are small-effect associations. Diet, antibiotics, and lifestyle have much larger impacts.</p>`;
    return html;
}

function exportCSV(genotypes) {
    let csv = "rsID,Locus,Your Genotype,Effect Allele,EA Count,Predicted Effect,What This Means\n";
    TARGET_SNPS.forEach(s => {
        const gt = genotypes[s.rsid] || "Not genotyped";
        let count = 0;
        if (typeof gt === "string" && gt.length === 2) {
            count = (gt[0] === s.ea ? 1 : 0) + (gt[1] === s.ea ? 1 : 0);
        }
        csv += `"${s.rsid}","${s.locus}","${gt}","${s.ea}","${count}","${s.effect}","${s.interpretation.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gut-microbiota-genetics-results.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// === DEMO DATA (embedded mini file) ===
const DEMO_DATA = `# This is a DEMO 23andMe raw data file containing ONLY the 13 SNPs used by the Microbiota-Host Genetics Interpreter
# For testing purposes only.
#
# rsid	chromosome	position	genotype
rs4988235	2	135859484	AGA
rs182549	2	135860000	CC
rs4556017	7	100632790	CC
rs550057	9	136146597	CC
rs9411378	9	136145425	CC
rs28407950	6	32626348	CC
rs2287921	19	49220827	TT
rs601338	19	49206108	GG
rs681343	19	49206462	CC
rs17007949	3	70920041	GG
rs4785960	16	4453319	GG
rs8182173	16	4420787	CC
rs708686	19	5840619	CC`;

document.getElementById('demoBtn').addEventListener('click', () => {
    statusEl.textContent = 'Loading demo data...';
    const genotypes = parse23andMe(DEMO_DATA);
    statusEl.textContent = `Demo loaded (${Object.keys(genotypes).length} SNPs) ✓`;

    // Build table and synopsis exactly like real upload
    let html = `<thead><tr><th>rsID</th><th>Locus</th><th>Your Genotype</th><th>Effect Allele</th><th>EA Count</th><th>Predicted Shift</th><th>What This Means (PCB4666 level)</th></tr></thead><tbody>`;
    TARGET_SNPS.forEach(s => {
        const gt = genotypes[s.rsid] || '<span class="text-gray-400">Not genotyped</span>';
        let count = 0;
        if (typeof gt === "string" && gt.length === 2) count = (gt[0]===s.ea?1:0) + (gt[1]===s.ea?1:0);
        html += `<tr><td class="font-mono">${s.rsid}</td><td>${s.locus}</td><td class="font-medium">${gt}</td><td>${s.ea} (ref ${s.ref})</td><td class="text-center">${count}</td><td class="text-sm">${s.effect}</td><td class="text-xs leading-relaxed">${s.interpretation}</td></tr>`;
    });
    html += `</tbody>`;
    tableEl.innerHTML = html;

    synopsisEl.innerHTML = generateSynopsis(genotypes);
    resultsDiv.classList.remove('hidden');

    exportBtn.onclick = () => exportCSV(genotypes);
});

fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    statusEl.textContent = 'Reading file...';
    const reader = new FileReader();
    reader.onload = ev => {
        const genotypes = parse23andMe(ev.target.result);
        statusEl.textContent = `Processed ${Object.keys(genotypes).length} variants ✓`;

        // Build rich table
        let html = `
            <thead>
                <tr>
                    <th>rsID</th>
                    <th>Locus</th>
                    <th>Your Genotype</th>
                    <th>Effect Allele</th>
                    <th>EA Count</th>
                    <th>Short Effect</th>
                    <th>What This Means (PCB4666 level)</th>
                </tr>
            </thead>
            <tbody>`;
        
        TARGET_SNPS.forEach(s => {
            const gt = genotypes[s.rsid] || '<span class="text-gray-400">Not genotyped</span>';
            let count = 0;
            if (typeof gt === "string" && gt.length === 2) {
                count = (gt[0] === s.ea ? 1 : 0) + (gt[1] === s.ea ? 1 : 0);
            }
            html += `
                <tr>
                    <td class="font-mono">${s.rsid}</td>
                    <td>${s.locus}</td>
                    <td class="font-medium">${gt}</td>
                    <td>${s.ea} <span class="text-gray-400">(ref ${s.ref})</span></td>
                    <td class="text-center font-medium">${count}</td>
                    <td class="text-sm">${s.effect}</td>
                    <td class="text-xs leading-relaxed">${s.interpretation}</td>
                </tr>`;
        });
        html += `</tbody>`;
        tableEl.innerHTML = html;

        synopsisEl.innerHTML = generateSynopsis(genotypes);
        resultsDiv.classList.remove('hidden');

        exportBtn.onclick = () => exportCSV(genotypes);
    };
    reader.readAsText(file);
});