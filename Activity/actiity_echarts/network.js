const data = [
  { parentColumn: "", childColumn: "A" },
  { parentColumn: "A", childColumn: "B" },
  { parentColumn: "A", childColumn: "C" },
  { parentColumn: "B", childColumn: "D", val: 30 },
  { parentColumn: "B", childColumn: "E", val: 50 },
  { parentColumn: "C", childColumn: "F", val: 20 },
  { parentColumn: "C", childColumn: "G", val: 40 },
  { parentColumn: "C", childColumn: "H", val: 60 }
];

const LEVEL_STYLES = [
  { color: "#555555", symbolSize: 22, borderWidth: 3 },
  { color: "#52ab80", symbolSize: 14, borderWidth: 2.4 },
  { color: "#e8aa63", symbolSize: 9, borderWidth: 2 }
];
const TREEMAP_FILL = "#606060";
const TREEMAP_BORDER = "#f0ae62";

function buildHierarchy(rows) {
  const nodeMap = new Map();

  const getNode = name => {
    if (!nodeMap.has(name)) {
      nodeMap.set(name, {
        name,
        value: null,
        children: []
      });
    }

    return nodeMap.get(name);
  };

  let root = null;

  rows.forEach(({ parentColumn, childColumn, val }) => {
    const child = getNode(childColumn);

    if (val !== undefined) {
      child.value = val;
    }

    if (parentColumn === "") {
      root = child;
      return;
    }

    const parent = getNode(parentColumn);
    parent.children.push(child);
  });

  return root;
}

function toTreeNode(node, depth = 0) {
  const levelStyle = LEVEL_STYLES[Math.min(depth, LEVEL_STYLES.length - 1)];

  return {
    name: node.name,
    value: node.value,
    symbolSize: levelStyle.symbolSize,
    itemStyle: {
      color: levelStyle.color,
      borderColor: levelStyle.color,
      borderWidth: levelStyle.borderWidth
    },
    children: node.children.map(child => toTreeNode(child, depth + 1))
  };
}

function toTreemapNode(node, depth = 0) {
  const children = node.children
    .map(child => toTreemapNode(child, depth + 1))
    .sort((a, b) => b.value - a.value);
  const value = children.length === 0
    ? (node.value ?? 0)
    : children.reduce((sum, child) => sum + child.value, 0);

  return {
    name: node.name,
    value,
    itemStyle: {
      color: depth === 0 ? "#ffffff" : TREEMAP_FILL
    },
    children
  };
}

const hierarchy = buildHierarchy(data);
const treeData = toTreeNode(hierarchy);
const treemapData = toTreemapNode(hierarchy);

const chart = echarts.init(document.getElementById("chart-view"));
const tabs = Array.from(document.querySelectorAll(".tab"));
let activeView = "tree";

function buildTooltip() {
  return {
    trigger: "item",
    triggerOn: "mousemove",
    backgroundColor: "rgba(34, 49, 72, 0.92)",
    borderWidth: 0,
    textStyle: {
      color: "#f9fbff"
    },
    formatter: params => {
      const value = params.data.value;
      return value !== null && value !== undefined
        ? `<strong>${params.data.name}</strong><br/>Value: ${value}`
        : `<strong>${params.data.name}</strong>`;
    }
  };
}

function buildTreeOption() {
  return {
    tooltip: buildTooltip(),
    series: [
      {
        type: "tree",
        data: [treeData],
        top: "8%",
        left: "8%",
        bottom: "8%",
        right: "8%",
        layout: "radial",
        symbol: "emptyCircle",
        expandAndCollapse: false,
        initialTreeDepth: 3,
        animationDurationUpdate: 750,
        roam: true,
        emphasis: {
          focus: "descendant"
        },
        lineStyle: {
          color: "#bcc9da",
          width: 1.4,
          curveness: 0.35
        },
        label: {
          position: "rotate",
          verticalAlign: "middle",
          align: "right",
          fontSize: 13,
          color: "#2f455b"
        },
        leaves: {
          label: {
            position: "rotate",
            verticalAlign: "middle",
            align: "left",
            fontSize: 12,
            color: "#2f455b"
          }
        }
      }
    ]
  };
}

function buildTreemapOption() {
  return {
    tooltip: buildTooltip(),
    series: [
      {
        type: "treemap",
        data: [treemapData],
        roam: false,
        nodeClick: false,
        sort: false,
        top: 8,
        left: 8,
        right: 8,
        bottom: 34,
        breadcrumb: {
          show: true,
          bottom: 4,
          height: 20,
          itemStyle: {
            color: "#676767",
            borderColor: "#ffffff",
            borderWidth: 1
          },
          textStyle: {
            color: "#ffffff"
          }
        },
        label: {
          show: false,
          color: "#ffffff",
          fontSize: 14,
          formatter: "{b}"
        },
        upperLabel: {
          show: false
        },
        itemStyle: {
          borderColor: TREEMAP_BORDER,
          borderWidth: 2,
          gapWidth: 2,
          borderRadius: 0
        },
        levels: [
          {
            itemStyle: {
              borderColor: "#ffffff",
              borderWidth: 0,
              gapWidth: 0
            },
            upperLabel: {
              show: true,
              color: "#343434",
              height: 18
            }
          },
          {
            itemStyle: {
              color: TREEMAP_FILL,
              borderColor: TREEMAP_BORDER,
              borderWidth: 3,
              gapWidth: 3,
              borderRadius: 0
            },
            upperLabel: {
              show: true,
              color: TREEMAP_BORDER,
              height: 18
            }
          },
          {
            itemStyle: {
              color: TREEMAP_FILL,
              borderColor: TREEMAP_BORDER,
              borderWidth: 2,
              gapWidth: 2,
              borderRadius: 0
            },
            label: {
              show: true,
              color: "#ffffff",
              position: "inside",
              fontSize: 13,
              fontWeight: 600,
              align: "center",
              verticalAlign: "middle"
            }
          },
          {
            itemStyle: {
              color: TREEMAP_FILL,
              borderColor: TREEMAP_BORDER,
              borderWidth: 2,
              gapWidth: 2,
              borderRadius: 0
            },
            label: {
              show: true,
              color: "#ffffff",
              position: "inside",
              fontSize: 13,
              fontWeight: 600,
              align: "center",
              verticalAlign: "middle"
            }
          }
        ]
      }
    ]
  };
}

function syncTabs() {
  tabs.forEach(tab => {
    const isActive = tab.dataset.view === activeView;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function renderChart(view = activeView) {
  activeView = view;
  chart.clear();
  chart.setOption(activeView === "tree" ? buildTreeOption() : buildTreemapOption(), true);
  syncTabs();
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => renderChart(tab.dataset.view));
});

renderChart("tree");

window.addEventListener("resize", () => chart.resize());
