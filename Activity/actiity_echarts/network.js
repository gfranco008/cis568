const data = [
  { parentColumn: "",  childColumn: "A" },
  { parentColumn: "A", childColumn: "B" },
  { parentColumn: "A", childColumn: "C" },
  { parentColumn: "B", childColumn: "D", val: 30 },
  { parentColumn: "B", childColumn: "E", val: 50 },
  { parentColumn: "C", childColumn: "F", val: 20 },
  { parentColumn: "C", childColumn: "G", val: 40 },
  { parentColumn: "C", childColumn: "H", val: 60 }
];

const LEVELS = [
  {
    itemStyle: {
      borderColor: "#555555",
      borderWidth: 3
    },
    label: {
      show: true
    }
  },
  {
    itemStyle: {
      borderColor: "#52ab80",
      borderWidth: 2.4
    },
    label: {
      show: true
    }
  },
  {
    itemStyle: {
      borderColor: "#e8aa63",
      borderWidth: 2
    },
    label: {
      show: true
    }
  }
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

function countLeaves(node) {
  if (node.children.length === 0) {
    node.leafCount = 1;
    return 1;
  }

  node.leafCount = node.children.reduce((total, child) => total + countLeaves(child), 0);
  return node.leafCount;
}

function buildGraphLayout(root, width, height) {
  countLeaves(root);

  const nodes = new Map();
  const links = [];
  const rootX = width / 2;
  const rootY = height / 2;
  const verticalPadding = Math.max(54, height * 0.14);
  const levelGap = Math.max(84, Math.min(170, width / 5.8));
  const rootSize = Math.max(26, Math.min(34, width * 0.042));
  const branchSize = Math.max(14, Math.min(18, width * 0.018));
  const leafSize = Math.max(8, Math.min(12, width * 0.011));
  const getLevelConfig = depth => LEVELS[Math.min(depth, LEVELS.length - 1)] || {};

  const registerNode = (node, x, y, side, depth) => {
    const isLeaf = node.children.length === 0;
    const isRoot = depth === 0;
    const levelConfig = getLevelConfig(depth);

    nodes.set(node.name, {
      id: node.name,
      name: node.name,
      value: node.value,
      x,
      y,
      side,
      depth,
      symbol: "circle",
      symbolSize: isRoot ? rootSize : (isLeaf ? leafSize : branchSize),
      itemStyle: {
        color: "#ffffff",
        borderColor: "#a7b8d0",
        borderWidth: isRoot ? 2.3 : 1.8,
        shadowBlur: isRoot ? 8 : 0,
        shadowColor: "rgba(107, 131, 166, 0.18)",
        ...levelConfig.itemStyle
      },
      label: {
        show: true,
        color: "#32475f",
        fontSize: isRoot ? 15 : 13,
        fontWeight: isRoot ? 600 : 500,
        position: isRoot ? "bottom" : (side === "left" ? "left" : "right"),
        distance: isRoot ? 10 : 6,
        ...levelConfig.label
      }
    });
  };

  const createLink = (source, target) => {
    const sourceNode = nodes.get(source.name);
    const targetNode = nodes.get(target.name);
    const verticalCurve = (targetNode.y - sourceNode.y) / Math.max(height * 0.52, 1);
    const sideBias = targetNode.side === "left" ? -0.08 : 0.08;
    const curveness = Math.max(-0.34, Math.min(0.34, verticalCurve + sideBias));

    links.push({
      source: source.name,
      target: target.name,
      lineStyle: {
        color: "#bcc9da",
        width: 1.7,
        curveness
      }
    });
  };

  const placeSubtree = (node, side, depth, top, bottom) => {
    const orderedChildren = side === "left"
      ? [...node.children].reverse()
      : [...node.children];

    let cursor = top;
    orderedChildren.forEach(child => {
      const span = ((bottom - top) * child.leafCount) / node.leafCount;
      placeSubtree(child, side, depth + 1, cursor, cursor + span);
      cursor += span;
    });

    const x = rootX + (side === "left" ? -1 : 1) * levelGap * depth;
    const y = orderedChildren.length === 0
      ? (top + bottom) / 2
      : orderedChildren.reduce((sum, child) => {
          const childNode = nodes.get(child.name);
          return sum + (childNode.y * child.leafCount);
        }, 0) / node.leafCount;

    registerNode(node, x, y, side, depth);
    orderedChildren.forEach(child => createLink(node, child));
  };

  const rootChildrenBySide = { left: [], right: [] };
  root.children.forEach((child, index) => {
    const side = index % 2 === 0 ? "right" : "left";
    rootChildrenBySide[side].push(child);
  });

  registerNode(root, rootX, rootY, "center", 0);

  ["left", "right"].forEach(side => {
    const sideChildren = rootChildrenBySide[side];
    if (sideChildren.length === 0) {
      return;
    }

    const totalLeaves = sideChildren.reduce((sum, child) => sum + child.leafCount, 0);
    let cursor = verticalPadding;

    sideChildren.forEach(child => {
      const span = ((height - (verticalPadding * 2)) * child.leafCount) / totalLeaves;
      placeSubtree(child, side, 1, cursor, cursor + span);
      createLink(root, child);
      cursor += span;
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    links
  };
}

const chartDom = document.getElementById("tree-chart");
const chart = echarts.init(chartDom);
const hierarchy = buildHierarchy(data);

function buildOption() {
  const width = Math.max(chart.getWidth(), 320);
  const height = Math.max(chart.getHeight(), 420);
  const { nodes, links } = buildGraphLayout(hierarchy, width, height);

  return {
    animationDuration: 900,
    animationDurationUpdate: 450,
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(34, 49, 72, 0.92)",
      borderWidth: 0,
      textStyle: {
        color: "#f9fbff"
      },
      formatter: params => {
        if (params.dataType === "edge") {
          return `${params.data.source} → ${params.data.target}`;
        }

        const value = params.data.value;
        return value !== null && value !== undefined
          ? `<strong>${params.data.name}</strong><br/>Value: ${value}`
          : `<strong>${params.data.name}</strong>`;
      }
    },
    series: [
      {
        type: "graph",
        layout: "none",
        coordinateSystem: null,
        data: nodes,
        links,
        roam: true,
        draggable: true,
        edgeSymbol: ["none", "arrow"],
        edgeSymbolSize: 8,
        label: {
          show: true
        },
        lineStyle: {
          opacity: 1
        },
        emphasis: {
          focus: "adjacency",
          scale: 1.06
        }
      }
    ]
  };
}

function renderChart() {
  chart.setOption(buildOption(), true);
}

renderChart();

window.addEventListener("resize", () => {
  chart.resize();
  renderChart();
});
