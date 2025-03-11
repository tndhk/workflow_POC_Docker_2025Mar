// ワークフロープリセット
exports.WORKFLOW_PRESETS = {
    'webdev': {
      name: 'Website Development',
      tasks: [
        { id: 1, name: 'Requirements Definition', duration: 5, dependencies: [], assignee: 'Project Manager' },
        { id: 2, name: 'Wireframe Creation', duration: 3, dependencies: [1], assignee: 'UX Designer' },
        { id: 3, name: 'Design', duration: 7, dependencies: [2], assignee: 'UI Designer' },
        { id: 4, name: 'Frontend Development', duration: 8, dependencies: [3], assignee: 'Frontend Dev' },
        { id: 5, name: 'Backend Development', duration: 10, dependencies: [3], assignee: 'Backend Dev' },
        { id: 6, name: 'Content Creation', duration: 7, dependencies: [2], assignee: 'Content Writer' },
        { id: 7, name: 'Integration Testing', duration: 5, dependencies: [4, 5, 6], assignee: 'QA Engineer' },
        { id: 8, name: 'Deployment', duration: 2, dependencies: [7], assignee: 'DevOps Engineer' },
      ]
    },
    'marketing': {
      name: 'Marketing Campaign',
      tasks: [
        { id: 1, name: 'Requirements Definition', duration: 3, dependencies: [], assignee: 'Marketing Manager' },
        { id: 2, name: 'Market Research', duration: 7, dependencies: [1], assignee: 'Market Analyst' },
        { id: 3, name: 'Strategy Planning', duration: 5, dependencies: [2], assignee: 'Marketing Strategist' },
        { id: 4, name: 'Content Creation', duration: 10, dependencies: [3], assignee: 'Content Creator' },
        { id: 5, name: 'Creative Production', duration: 8, dependencies: [3], assignee: 'Graphic Designer' },
        { id: 6, name: 'Media Selection', duration: 3, dependencies: [3], assignee: 'Media Planner' },
        { id: 7, name: 'Campaign Execution', duration: 14, dependencies: [4, 5, 6], assignee: 'Marketing Team' },
        { id: 8, name: 'Results Measurement', duration: 7, dependencies: [7], assignee: 'Data Analyst' },
      ]
    },
    'product': {
      name: 'Product Development',
      tasks: [
        { id: 1, name: 'Requirements Definition', duration: 5, dependencies: [], assignee: 'Product Manager' },
        { id: 2, name: 'Market Research', duration: 10, dependencies: [1], assignee: 'Research Team' },
        { id: 3, name: 'Concept Development', duration: 7, dependencies: [2], assignee: 'Product Designer' },
        { id: 4, name: 'Prototype Design', duration: 8, dependencies: [3], assignee: 'Engineering Team' },
        { id: 5, name: 'Prototype Creation', duration: 14, dependencies: [4], assignee: 'Engineering Team' },
        { id: 6, name: 'Testing', duration: 10, dependencies: [5], assignee: 'QA Team' },
        { id: 7, name: 'Refinement', duration: 7, dependencies: [6], assignee: 'Engineering Team' },
        { id: 8, name: 'Production Preparation', duration: 14, dependencies: [7], assignee: 'Production Team' },
        { id: 9, name: 'Launch', duration: 5, dependencies: [8], assignee: 'Marketing Team' },
      ]
    }
  };