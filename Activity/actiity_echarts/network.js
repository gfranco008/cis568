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

function toTreeNode(node) {
  return {
    name: node.name,
    value: node.value,
    children: node.children.map(toTreeNode)
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
      symbol: "circle",
      symbolSize: 10,
      expandAndCollapse: false,
      initialTreeDepth: 3,
      animationDurationUpdate: 750,
      roam: true,
      emphasis: {
        focus: "descendant"
      },
      itemStyle: {
        color: "#8fa8c6",
        borderColor: "#a9bad1",
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
