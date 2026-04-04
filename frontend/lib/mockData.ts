export const mockUser = {
  id: "u1",
  name: "Dr. Alan Turing",
  email: "alan.turing@openscholar.edu",
  role: "faculty",
  department: "Computer Science"
};

export const mockPapers = [
  {
    id: "p1",
    title: "Quantum Computing: A New Frontier in Cryptography",
    abstract: "This paper explores the theoretical limits of quantum prime factorization and its implications for RSA security. We propose a new lattice-based approach resilient to Shor's algorithm.",
    authors: ["Alan Turing", "Richard Feynman"],
    year: 2024,
    department: "Computer Science",
    citationCount: 42,
    doi: "10.1234/qc.2024.1",
    keywords: ["Quantum", "Cryptography", "Security"]
  },
  {
    id: "p2",
    title: "Machine Learning Optimization via Federated Networks",
    abstract: "An analysis of distributed gradient descent over unreliable networks. We demonstrate a 15% improvement in convergence speed using our novel averaging technique.",
    authors: ["Grace Hopper"],
    year: 2023,
    department: "Artificial Intelligence",
    citationCount: 156,
    doi: "10.1234/ml.2023.2",
    keywords: ["Federated Learning", "Optimization"]
  },
  {
    id: "p3",
    title: "The Impact of Microplastics on Benthic Ecosystems",
    abstract: "A ten-year longitudinal study observing the integration of microplastics into the food web of deep-sea benthic organisms.",
    authors: ["Sylvia Earle", "Jane Goodall"],
    year: 2024,
    department: "Marine Biology",
    citationCount: 8,
    doi: "10.1234/mb.2024.3",
    keywords: ["Ecology", "Microplastics", "Oceanography"]
  }
];

export const mockComments = [
  {
    id: "c1",
    paperId: "p1",
    userId: "u2",
    authorName: "John von Neumann",
    content: "Fascinating approach. Have you considered the implications of noise on the lattice structure?",
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: "r1",
        userId: "u1",
        authorName: "Alan Turing",
        content: "Yes, section 4 details error-correction methodologies.",
        createdAt: new Date().toISOString()
      }
    ]
  }
];

export const mockConversations = [
  {
    id: "conv1",
    participants: [{ id: "u1", name: "Dr. Alan Turing" }, { id: "u2", name: "John von Neumann" }],
    lastMessage: "Are we meeting for the symposium tomorrow?",
    updatedAt: new Date().toISOString(),
    unreadCount: 3
  }
];

export const mockMessages = {
  "conv1": [
    {
      id: "m1",
      senderId: "u2",
      text: "I read your latest draft.",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "m2",
      senderId: "u1", // me
      text: "Thanks, what did you think?",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "m3",
      senderId: "u2",
      text: "Are we meeting for the symposium tomorrow?",
      createdAt: new Date().toISOString()
    }
  ]
};
