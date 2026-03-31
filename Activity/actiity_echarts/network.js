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

const treeData = toTreeNode(buildHierarchy(data));
const chart = echarts.init(document.getElementById("tree-chart"));

const option = {
  tooltip: {
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
  },
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
      itemStyle: {
        color: LEVEL_STYLES[0].color,
        borderColor: LEVEL_STYLES[0].color,
        borderWidth: 1.8
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
      },
      levels: [
        {
          itemStyle: {
            color: "#555555",
            borderColor: "#555555",
            borderWidth: 3
          },
          label: {
            show: true,
            position: "inside",
            align: "center",
            verticalAlign: "middle",
            fontSize: 14,
            fontWeight: 700,
            color: "#ffffff"
          }
        },
        {
          itemStyle: {
            color: "#52ab80",
            borderColor: "#52ab80",
            borderWidth: 2.4
          },
          label: {
            show: true
          }
        },
        {
          itemStyle: {
            color: "#e8aa63",
            borderColor: "#e8aa63",
            borderWidth: 2
          },
          label: {
            show: true
          }
        }
      ]
    }
  ]
};

chart.setOption(option);
window.addEventListener("resize", () => chart.resize());
