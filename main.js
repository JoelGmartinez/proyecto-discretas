/* ============================================================
   SISTEMA DE PRERREQUISITOS
   ============================================================ */

/* ---------------------------------------------
   DEFINICIÓN DE CURSOS (NODOS)
--------------------------------------------- */
const courses = {
    'C1': { name: 'Cálculo I', x: 100, y: 100 },
    'C2': { name: 'Cálculo II', x: 100, y: 200 },
    'C3': { name: 'Cálculo III', x: 100, y: 300 },
    'AL': { name: 'Álgebra Lineal', x: 250, y: 200 },
    'P1': { name: 'Programación I', x: 400, y: 100 },
    'P2': { name: 'Programación II', x: 400, y: 200 },
    'ED': { name: 'Estructuras de Datos', x: 400, y: 300 },
    'BD': { name: 'Base de Datos', x: 300, y: 400 },
    'F1': { name: 'Física I', x: 550, y: 200 },
    'F2': { name: 'Física II', x: 550, y: 300 },
    'MD': { name: 'Matemática Discreta', x: 700, y: 200 },
    'ALG': { name: 'Algoritmos', x: 550, y: 400 },
    'IS': { name: 'Ingeniería de Software', x: 400, y: 500 }
};

/* ---------------------------------------------
   DEFINICIÓN DE PRERREQUISITOS (ARISTAS)
--------------------------------------------- */
const prerequisites = [
    ['C1', 'C2'], ['C2', 'C3'], ['C1', 'AL'], ['AL', 'C3'],
    ['C1', 'F1'], ['F1', 'F2'],
    ['P1', 'P2'], ['P2', 'ED'], ['ED', 'ALG'], ['ED', 'BD'],
    ['MD', 'ED'], ['MD', 'ALG'],
    ['P2', 'IS'], ['ED', 'IS'], ['BD', 'IS']
];

const courseKeys = Object.keys(courses);

/* ---------------------------------------------
   CALCULAR MATRIZ DE ADYACENCIA
--------------------------------------------- */
const adjacencyMatrix = courseKeys.map(from =>
    courseKeys.map(to =>
        prerequisites.some(([a, b]) => a === from && b === to) ? 1 : 0
    )
);

/* ---------------------------------------------
   CALCULO DE RELACIONES
--------------------------------------------- */
function getDirectPrerequisites(course) {
    return prerequisites.filter(([_, b]) => b === course).map(([a]) => a);
}

function getDirectDependents(course) {
    return prerequisites.filter(([a]) => a === course).map(([_, b]) => b);
}

function getIndirectPrerequisites(course, visited = new Set()) {
    if (visited.has(course)) return [];
    visited.add(course);

    const direct = getDirectPrerequisites(course);
    const indirect = direct.flatMap(pre => getIndirectPrerequisites(pre, visited));

    return [...new Set([...direct, ...indirect])];
}

/* ---------------------------------------------
   SISTEMA DE TABS
--------------------------------------------- */
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContent = document.getElementById("tab-content");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active-tab", "bg-indigo-600", "text-white"));
        btn.classList.add("active-tab", "bg-indigo-600", "text-white");

        const selected = btn.getAttribute("data-tab");
        renderTab(selected);
    });
});

/* ---------------------------------------------
   RENDERIZAR TODAS LAS VISTAS
--------------------------------------------- */
function renderTab(tab) {
    if (tab === "graph") renderGraphView();
    if (tab === "properties") renderPropertiesView();
    if (tab === "matrix") renderMatrixView();
}

/* ---------------------------------------------
   ==== 1. VISTA DEL GRAFO ====
--------------------------------------------- */
let selectedNode = null;

function renderGraphView() {
    tabContent.innerHTML = `
        <div class="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p class="text-blue-900"><strong>Interactivo:</strong> Haz clic en cualquier curso.</p>
        </div>

        <div class="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4"
             style="height: 700px;">
            
            <div class="relative mx-auto" style="width: 800px; height: 600px;">
                <svg id="graph-svg" width="800" height="600" class="absolute top-0 left-0">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="10" 
                                refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#6366f1"></polygon>
                        </marker>
                    </defs>
                </svg>
                <div id="graph-nodes" class="absolute top-0 left-0 w-full h-full"></div>
            </div>

        </div>

        
    `;
    //<div id="course-details"></div>
    drawGraph();
}

function drawGraph() {
    const svg = document.getElementById("graph-svg");
    const nodesDiv = document.getElementById("graph-nodes");
    
    // Limpiar nodos
    nodesDiv.innerHTML = "";
    
    // Limpiar solo las líneas del SVG (mantener defs)
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    /* --- DIBUJAR ARISTAS --- */
    prerequisites.forEach(([from, to]) => {
        const A = courses[from];
        const B = courses[to];
        const highlight = selectedNode === from || selectedNode === to;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", A.x);
        line.setAttribute("y1", A.y);
        line.setAttribute("x2", B.x);
        line.setAttribute("y2", B.y);
        line.setAttribute("stroke", highlight ? "#4f46e5" : "#6366f1"); // Azul más visible
        line.setAttribute("marker-end", "url(#arrowhead)");
        line.setAttribute("stroke-width", highlight ? "3" : "2");
        line.setAttribute("opacity", highlight ? "1" : "0.6");

        svg.appendChild(line);
    });

    /* --- DIBUJAR NODOS --- */
    Object.entries(courses).forEach(([code, info]) => {
        const isSelected = selectedNode === code;
        const directPre = getDirectPrerequisites(code);
        const directDep = getDirectDependents(code);
        const isRelated = selectedNode && (
            directPre.includes(selectedNode) || 
            directDep.includes(selectedNode) ||
            code === selectedNode
        );

        const div = document.createElement("div");
        div.className = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
            isSelected ? 'scale-110 z-10' : isRelated ? 'scale-105' : ''
        }`;

        div.style.left = `${info.x}px`;
        div.style.top = `${info.y}px`;

        div.innerHTML = `
            <div class="px-4 py-2 rounded-lg shadow-lg border-2 ${
                isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-700' 
                    : isRelated
                    ? 'bg-indigo-100 border-indigo-400'
                    : 'bg-white border-gray-300'
            }">
                <div class="font-bold text-sm">${code}</div>
                <div class="text-xs">${info.name}</div>
            </div>
        `;

        div.addEventListener("click", () => {
            selectedNode = isSelected ? null : code;
            drawGraph();
            renderCourseDetails();
        });

        nodesDiv.appendChild(div);
    });

    renderCourseDetails();
}

/* ---------------------------------------------
   DETALLES DEL CURSO SELECCIONADO
--------------------------------------------- */
function renderCourseDetails() {
    const box = document.getElementById("course-details");
    if (!selectedNode) {
        box.innerHTML = "";
        return;
    }

    const directPre = getDirectPrerequisites(selectedNode);
    const indirectPre = getIndirectPrerequisites(selectedNode)
        .filter(c => !directPre.includes(c));
    const directDep = getDirectDependents(selectedNode);

    const pill = (code, color) =>
        `<span class="px-3 py-1 ${color} rounded-full text-sm">${code}: ${courses[code].name}</span>`;

    box.innerHTML = `
        <div class="mt-4 p-4 bg-white rounded-lg shadow-lg border-2 border-indigo-200">
            <h3 class="text-xl font-bold text-indigo-900 mb-3">
                ${selectedNode}: ${courses[selectedNode].name}
            </h3>

            <div class="space-y-3">

                <div>
                    <h4 class="font-semibold text-gray-700 mb-1">
                        Prerrequisitos Directos (${directPre.length}):
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        ${directPre.length
                            ? directPre.map(c => pill(c, "bg-blue-100 text-blue-800")).join("")
                            : '<span class="text-gray-500">Ninguno (curso inicial)</span>'}
                    </div>
                </div>

                <div>
                    <h4 class="font-semibold text-gray-700 mb-1">
                        Prerrequisitos Indirectos (${indirectPre.length}):
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        ${indirectPre.length
                            ? indirectPre.map(c => pill(c, "bg-purple-100 text-purple-800")).join("")
                            : '<span class="text-gray-500">Ninguno</span>'}
                    </div>
                </div>

                <div>
                    <h4 class="font-semibold text-gray-700 mb-1">
                        Habilita directamente (${directDep.length}):
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        ${directDep.length
                            ? directDep.map(c => pill(c, "bg-green-100 text-green-800")).join("")
                            : '<span class="text-gray-500">Ninguno (curso terminal)</span>'}
                    </div>
                </div>

            </div>
        </div>
    `;
}

/* ---------------------------------------------
   ==== 2. PROPIEDADES DE LA RELACIÓN ====
--------------------------------------------- */
function renderPropertiesView() {
    tabContent.innerHTML = `
        <div class="space-y-6 p-6 bg-white rounded-lg">

            <h3 class="text-2xl font-bold text-gray-800 mb-4">Análisis de Propiedades</h3>

            ${propertyCard(
                "Reflexividad",
                "NO REFLEXIVA",
                false,
                "Ningún curso es prerrequisito de sí mismo.",
                "(C1, C1) ∉ R",
                "Evita ciclos triviales."
            )}

            ${propertyCard(
                "Simetría",
                "NO SIMÉTRICA",
                false,
                "Si A → B, no se cumple que B → A.",
                "(C1, C2) ∈ R pero (C2, C1) ∉ R",
                "Evita ciclos bidireccionales."
            )}

            ${propertyCard(
                "Antisimetría",
                "ANTISIMÉTRICA ✓",
                true,
                "No existen pares donde ambos sean prerrequisitos del otro.",
                "Si (a,b) ∈ R entonces (b,a) ∉ R",
                "Modela un orden parcial."
            )}

            ${propertyCard(
                "Transitividad",
                "TRANSITIVA (en cierre) ✓",
                true,
                "Si A→B y B→C, entonces A→C en R⁺.",
                "(C1 → C2) y (C2 → C3) ⇒ (C1 → C3)",
                "Permite dependencias indirectas."
            )}

            <div class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 class="font-bold text-blue-900 mb-2">Clasificación</h4>
                <p class="text-blue-800">
                    La relación es un <b>orden parcial estricto</b>.
                </p>
            </div>
        </div>
    `;
}

function propertyCard(title, result, positive, explanation, example, academic) {
    return `
        <div class="border rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between mb-2">
                <h4 class="font-bold text-lg text-gray-800">${title}</h4>
                <span class="px-3 py-1 rounded-full text-sm font-semibold
                    ${positive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
                    ${result}
                </span>
            </div>
            <p class="text-gray-700 mb-2"><b>Análisis:</b> ${explanation}</p>
            <p class="text-gray-600 mb-2"><b>Ejemplo:</b> ${example}</p>
            <p class="text-indigo-700"><b>Interpretación académica:</b> ${academic}</p>
        </div>
    `;
}

/* ---------------------------------------------
   ==== MATRIZ ====
--------------------------------------------- */
function renderMatrixView() {
    tabContent.innerHTML = `
        <div class="overflow-x-auto p-6 bg-white rounded-lg">

            <h3 class="text-2xl font-bold text-gray-800 mb-4">Matriz</h3>
            <p class="text-gray-600 mb-4">
                M[i,j] = 1 si el curso i es prerrequisito de j.
            </p>

            <table class="border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th class="border p-2 bg-gray-100"></th>
                        ${courseKeys.map(code =>
                            `<th class="border p-2 bg-gray-100 text-xs font-bold">${code}</th>`
                        ).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${courseKeys.map((row, i) => `
                        <tr>
                            <th class="border p-2 bg-gray-100 text-xs font-bold">${row}</th>
                            ${adjacencyMatrix[i].map(v =>
                                `<td class="border p-2 text-center text-sm
                                    ${v ? "bg-indigo-100 text-indigo-800 font-bold" : "bg-white text-gray-400"}">
                                    ${v}
                                </td>`
                            ).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            
    `;
}

/* ---------------------------------------------

    <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-bold text-blue-900 mb-2">Total prerrequisitos directos</h4>
                    <p class="text-3xl font-bold text-blue-700">${prerequisites.length}</p>
                </div>

                <div class="p-4 bg-purple-50 rounded-lg">
                    <h4 class="font-bold text-purple-900 mb-2">Cursos sin prerrequisitos</h4>
                    <p class="text-3xl font-bold text-purple-700">
                        ${courseKeys.filter(c => getDirectPrerequisites(c).length === 0).length}
                    </p>
                </div>
            </div>

        </div>




   ESTADÍSTICAS FINALES (FOOTER)
--------------------------------------------- */
function renderFooter() {
    document.getElementById("footer-stats").innerHTML = `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex items-center gap-2 text-indigo-600 mb-2">
                <i data-feather="book-open"></i>
                <h4 class="font-bold">Total Cursos</h4>
            </div>
            <p class="text-3xl font-bold text-gray-800">${courseKeys.length}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex items-center gap-2 text-green-600 mb-2">
                <i data-feather="git-branch"></i>
                <h4 class="font-bold">Relaciones</h4>
            </div>
            <p class="text-3xl font-bold text-gray-800">${prerequisites.length}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex items-center gap-2 text-purple-600 mb-2">
                <i data-feather="database"></i>
                <h4 class="font-bold">Tipo de Orden</h4>
            </div>
            <p class="text-lg font-bold text-gray-800">Parcial Estricto</p>
        </div>
    `;

    feather.replace();
}

/* ---------------------------------------------
   INICIALIZACIÓN
--------------------------------------------- */
renderTab("graph");
renderFooter();
