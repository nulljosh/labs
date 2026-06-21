Agentic AI for Dummies (3rd Ed.) —
Compiled Summary: Chapters 2–6
> Note: Chapter 1 was not summarized. This covers chapters 2 through 6.

---


Chapter 2 — Peeking Inside the AI Agent
Mind
Overview
How agentic AI systems think, remember, and act. Covers the internal architecture that
separates agents from basic generative AI.

---

Building Blocks of Agentic AI
      • Mission/objective — each agent gets a clear goal. Uses task decomposition to break it
        into sub-goals, prioritize, and pick the best actions given available resources.
      • Short-term memory — info held within the current session/conversation.
      • Long-term memory — persistent across sessions, stored in databases or vector stores (e.g.
        Pinecone, FAISS). Critical for continuity and context-awareness.
      • Tool linkage — agents can't act in isolation; they use APIs, external tools, other AI
        models. LangChain (chains of reasoning), AutoGen (multi-agent collaboration + code
        execution), OpenAI function calling.
      • Communication and coordination — agents share updates, delegate subtasks, resolve
        conﬂicts, sync progress using messaging frameworks and state management.
      • World modeling — internal representation of the environment. Gives the agent context
        about conditions, constraints, and what's possible. Discussed more in Ch. 3.

---

Human Oversight ("The Overseers")
Without proper planning and oversight, agents can fail, drift, or cause damage. Like a horse
trained for speciﬁc tasks — it performs well within its design, but needs the right tools and
controls. Agents rely on human design and oversight to function responsibly.

---
Reasoning, Memory, and Goal Setting
AI's Analytical Intelligence (What It Has)

AI replicates analytical intelligence — analyze, evaluate, manipulate info to solve problems.
Includes critical thinking, logical reasoning, problem-solving.

What AI lacks: creative, intuitive, moral, intrapersonal, naturalistic, emotional, existential, and
musical intelligence. These remain distinctly human.

Memory Design

      • AI doesn't "remember" like humans — it uses structured data retention/retrieval.
      • Stores info agents can retrieve to build continuity, maintain context, appear intelligent
        over time.
      • Without memory, every interaction starts fresh with no prior context.
      • LangChain modules: `ConversationBuﬀerMemory` (dialogue history),
        `VectorStoreRetrieverMemory` (relevant knowledge retrieval via embeddings).
      • ReAct pattern (Reason + Act) — advanced architectures blend memory with real-time
        reasoning. Agent remembers previous actions and results, uses them to inform next steps.

Memory risks

      • Too-personal memory enables creepy personalization. Can build biases. Long-term memory
        capabilities can exacerbate privacy/security concerns.
      • Systems using only short-term memory reset after each session. Can frustrate users
        expecting continuity.

Goal Setting

      • Goals can be simple or complex; agents interpret broader objectives and determine speciﬁc
        outcomes autonomously.
      • Goal structure — breaks high-level objectives into tactical sub-goals and speciﬁc actions.
      • Goal priority — weighs competing objectives (e.g. speed vs. compliance in a shipping
        route).
      • Autonomy raises concerns about business alignment. Agents must stay aligned with
        business-wide policies and goals — human oversight required for the foreseeable future.

---

Adaptive Behavior and Self-Directed Learning
Adaptive Behavior

AI evaluates progress toward its goal, assesses whether its strategy is working, and pivots to an
alternative approach if needed. This is what makes agents far more useful in dynamic real-world
contexts (customer service, logistics, healthcare diagnostics) where variables emerge mid-task.
Adaptive behavior relies on:

      • Pattern recognition in successes/failures — compares current state to desired outcome,
        adjusts plan or tactics
      • Combination of memory, world modeling, and planning capabilities

Self-Directed Learning

Goes further than adaptive behavior — agents identify what they need to learn without explicit
human guidance. They don't train on a ﬁxed dataset; they actively seek out new information and
experiences.

Process:

1. Recognize when current knowledge is insuﬃcient for the assigned task.

2. Determine what additional information or skills would most improve performance.

3. Figure out how to acquire it — or all three.

Mechanisms: meta-learning (learning how to learn) and agentic reﬂection (self-assessment of
performance).

Meta-Learning

      • Temporal aspect: balances immediate performance vs. non-technical long-term learning.
      • Can improve goal-setting/planning strategies and communication/collaboration strategies
        across the board.
      • Example: ﬁnancial trading agent monitors context, analyzes deteriorating performance,
        diagnoses sources, tests remedies, validates improvements via backtesting before
        reintegrating.

---

Directing Agentic AI
Prompting GenAI ≠ Directing Agentic AI. You give an agent an end goal, not step-by-step
instructions.

What to provide

      • Background information: constraints, preferences, what resources the agent can/cannot
        access.
      • Deﬁned success criteria: quality standards, strategic alignment expectations.

How it works

1. Agent outlines its strategy, asks if you want to proceed.

2. If yes — it starts working autonomously or semi-autonomously.
3. At key decision points, it pauses and asks for a decision/permission.

4. On completion, delivers output and suggests next steps.

Agents use memory components to streamline their work on a mission; others use real-time
reasoning to resolve ambiguity. If a source is missing, they ﬂag it and may recommend how to
resolve it.

Level of oversight is conﬁgurable — hands-on (frequent check-ins) or hands-oﬀ (notify only on
completion).

---

GenAI vs. Agentic AI
| Aspect | GenAI | Agentic AI |

|---|---|---|

| Method of interaction | Prompting | Instructing |

| Type of interaction | One-shot response | Multi-step, dynamic |

| Autonomy | Low (reacts to prompts) | High (plans and acts) |

| Feedback | Needs manual retries | Built-in checkpoints, self-corrects |

Agentic AI is not replacing GenAI — it's GenAI plus planning, memory, reasoning, and goal
pursuit layered on top. GenAI = ideation; Agentic AI = execution.

---

Combining Generative + Real-Time Decision-Making
Two critical capabilities working together:

1. Creative power of LLMs — interpret intent, draft plans, produce content, communicate in
context-aware ways.

2. Sophisticated real-time decision-making — independent goal pursuit via dynamic
reasoning loops. Ongoing evaluation of what's happening (reconsidering assumptions), what
might happen next (adjusting strategy), and how to proceed (selecting action).

The agent chooses the next best action in a sequence that may span hours, days, or longer. It
balances speed against quality, short-term against long-term impacts.

Persistence across time

| Feature | GenAI | Agentic AI |

|---|---|---|
| Language/creativity | Yes | Yes (inherited + enhanced) |

| Decision-making | Limited/static | Dynamic, real-time, adaptive |

| Goal pursuit | No | Yes (sets and pursues goals) |

| Execution | No | Yes (executes plans over time) |

| Adaptability | Limited | High (continuously learns and adjusts) |

Traditional GenAI = single-session. Agentic AI = persistent, tracks tasks, stores knowledge
across sessions, remembers what worked and what didn't. Not just intelligent — persistent.

Operates across interconnected, complex enterprise environments with unpredictable
dependencies. Adapts nonlinearly — the messy, adaptive nature of real-world problem-solving.

---


Chapter 3 — Meeting Agentic AI Core
Technologies
Overview
The underlying tech stack that makes agentic AI possible: multi-agent coordination, world
modeling, communication protocols (MCP/ANP/A2A/ACP), self-correction loops, multimodal
input, and how to actually build agents.

---

Multi-Agent Coordination and Planning
Single agents can't handle many complex tasks (supply chains, simulations, autonomous ﬂeets).
Multi-agent systems address this through:

Computational complexity and task decomposition

      • Task decomposition — breaks large problems into manageable subtasks. Even small
        glitches in complex tasks cause big failures (e.g. warehouse robot misreading inventory,
        trading agent buying wrong shares).
      • Requires convergence of tech that can work together eﬀectively within seconds.

Specialized expertise and division of labor

      • Specialized agents enhanced for speciﬁc domains or capabilities — one for NLP, one for
        computer vision, one for logical reasoning.
      • Together they complete tasks too diﬃcult for one generalist agent.
Scalability and fault tolerance

      • Horizontal scaling — add/remove agents based on demand without reducing
        performance.
      • Sophisticated load-balancing — agents monitor own capacity, request task reassignment.
      • Adapt for future performance goals — spawn/retire agents using intelligent policies.
      • Fault tolerance at two levels:
      • Basic: agent redundancy — no single point of failure.
      • Higher: hierarchical fault tolerance — supervisor agents monitor subordinate agents,
        reassign tasks, restart failed agents.

Distributed resources

      • Decision-making occurs where information resides rather than waiting on a central
        command.
      • Addresses latency + communication overhead for real-time systems (autonomous vehicles,
        smart city infrastructure).
      • Edge computing — local sensors/devices for urgent, split-second decisions.
      • Cloud computing — internet-based, for non-urgent computations.

---

Contextual Awareness and Situational Reasoning
Interplay between contextual awareness (what's happening, where, with whom) and situational
reasoning (what should I do about it, and why).

World modeling

      • Provides a shared representation of the environment including spatial, temporal, and
        causal relationships.
      • Exists on a spectrum from simple state representations to large-scale simulations and 3D
        environments.
      • Allows agents to anchor context, predict consequences, and plan/reason over time.
      • Constructing world models is expensive — start simpler; a lightweight, well-tuned model
        often beats an overly detailed one.

Perception and sensor fusion

      • Agents perceive via: cameras, LiDAR, microphones, GPS, IMU, infrared, tactile sensors,
        APIs, network data.
      • Sensor fusion merges inputs into a uniﬁed, usable understanding of the environment.
      • Enables: adapting to environmental changes in real-time, detecting emergent patterns,
        recognizing symbolic meanings.
      • Sensor types by use case:
      • Autonomous vehicles: LiDAR, radar, cameras, IMU, GPS
      • Industrial robots: tactile, force, vibration sensors
      • Software agents: APIs, databases, network data
      • Drones: IMU, barometric pressure, GPS
Memory architectures (three types)

      • Episodic memory — recall speciﬁc events or experiences
      • Semantic memory — store general knowledge or learned facts
      • Shared memory — collaboration and information exchange between agents

Theory of mind modeling

      • Each agent must model the beliefs, goals, and likely actions of other agents.
      • Enables agents to:
      • Anticipate partner/adversary behavior
      • Avoid redundant work (circumvent tasks another agent is already doing)
      • Strategize in cooperative or competitive settings
      • Note: agents don't actually understand others' thoughts — they use patterns and
        probabilities to approximate what another agent or person might do.

Communication protocols and intent signaling

      • Negotiation protocols — agents propose, bargain, agree on plans or resource allocations.
      • Task allocation mechanisms — capability/availability/workload-based task assignment via
        competitive bidding.
      • Status updates and goal sharing — synchronize actions, signal intent, adapt dynamically.

---

Emerging Coordination Mechanisms
      • Consensus algorithms — distributed agreement without a human boss or central
        program. Key examples:
      • Byzantine Fault Tolerance (BFT) — keeps working correctly even when some parts fail
        unpredictably or act maliciously.
      • Raft — elects a leader to coordinate updates; assumes parts might crash but won't actively
        deceive.
      • Auction-based task allocation — agents bid on tasks; eﬀectively distributes work.
      • Hierarchical planning systems — higher-level agents direct lower-level specialists.
        Supervisor agents decompose complex problems.
      • Game-theoretic approaches — mathematical frameworks for strategic interaction
        between agents with potentially conﬂicting goals. Negotiation, fair resource sharing, stable
        cooperation strategies.

Communication and shared understanding

      • Recent protocols: MCP, ANP, A2A, ACP (see below).
      • Agents need: allow diﬀerent-origin agents to share info, maintain shared environment
        understanding, use natural language (NLP/LLMs) rather than rigid computer code.

---
The Four Integration Protocols
MCP — Model Context Protocol

      • Created by Anthropic, open-sourced late 2024.
      • Like a USB-C port for AI: universal adapter between AI apps and external data sources/
        tools.
      • Client-server model. Uses lightweight JSON-RPC.
      • Gives developers a reliable, consistent way for AI tools to request data or trigger actions.
      • Limitations: narrow scope, doesn't support complex peer-to-peer or agent-to-agent
        interactions. Situational instability.

ANP — Agent Network Protocol

      • Decentralized internet for agents. Peer-to-peer, equal footing.
      • Uses decentralized identiﬁers (DIDs) and semantic web linked-data tech.
      • Agents negotiate directly, form relationships without a central authority.
      • Strength: resilience, no single point of failure.
      • Weakness: complex to build and maintain; requires infrastructure many orgs can't handle
        yet.

A2A — Agent-to-Agent Protocol

      • Developed by Google, now open-source community.
      • Enables: capability discovery, task orchestration, multimodal content exchange, long-
        running workﬂows.
      • Like a Slack channel for agent-to-agent chats (vs. MCP = phone line to a tool).
      • Structured message format, tracked conversation threads, state context sharing.
      • Barrier: slower industry adoption; managing disagreeing agents/maintaining shared
        context is technically demanding.

ACP — Agent Communication Protocol

      • From IBM Research's BeeAI, maintained under Linux Foundation.
      • REST-based (HTTPS, JSON, REST APIs). Supports both sync and async calls, stateful or
        stateless conversations.
      • Highly structured, secure, auditable — targets regulated industries (healthcare, ﬁnance,
        government).
      • Complementary to MCP: MCP handles tool access layer, ACP manages conversation layer.
        Together they make large-scale multi-agent collaboration possible.

---

Self-Correcting Continuous Improvement
Agentic AI systems learn and adjust behavior in real-time — unlike traditional software on ﬁxed
instructions.
Feedback loops

At the heart: agents monitor own actions and results, determine what they did right/wrong.
When something doesn't go as planned, they analyze, adjust reasoning, try a new approach.

How agents share lessons

      • Policy updates — adjust mathematical rules guiding future actions, sync to peers or
        shared repository.
      • Embedding sharing — compact vector representations capture what was learned about a
        task or environment.
      • Memory synchronization — periodically update shared memory store so others can read
        new facts, outcomes, warnings.
      • Federated learning — each agent trains locally; results aggregated to improve the group's
        global model without moving raw data.

These methods give multi-agent systems a hive-mind that continuously reﬁnes itself. Beneﬁts:

      • Collective intelligence — learned lessons spread across the network.
      • Decentralized coordination — agents coordinate knowledge transfer through messaging
        protocols and shared world models.
      • Adaptive reasoning — each agent can reason based on shared context.

Correcting more than mistakes

      • Systems improve autonomously to stay aligned in fast-changing environments
        (cybersecurity, ﬁnance, emergency response).
      • Ethics, misinfo risks, criminal use remain issues — same as with any new tool (see Ch. 7).

---

Multimodal Input and Cross-Domain Functionality
Reactive vs. proactive

      • Traditional prompt-based = reactive (wait for prompt, respond).
      • Agentic AI = goal-driven, proactive. Continuously seek out new information, coordinate,
        write programs for other agents if needed.

Multiple input streams

Agents can: see (cameras/visual data), hear (microphones/audio), read (structured +
unstructured data), sense (IoT sensors), interpret (spoken or written human instructions).

Multimodal agents integrate diverse inputs into shared mental models, grounding abstract goals
in concrete reality.

Cross-domain
      • A single network of agents can operate across multiple industries, functions, or knowledge
        domains.
      • Healthcare example: one agent monitors ICU vitals, one tracks medications, a third pulls
        from electronic records to detect anomalies — cross-functional AI team bridging silos
        humans struggle to bridge.
      • Shared knowledge graphs, ﬂexible APIs, common data standards, and world models form
        the backbone of evolving multimodal systems.

Toward AGI (not there yet)

This adaptability — applying skills across contexts — is often described as a step toward AGI.
Agentic AI is just a step, not superintelligence. The future: both sides will sense, reason, respond
to one another within shared contexts; understand tone/environment/intent; share context
emerging from networks of intelligent agents across disciplines.

---

Building AI Agents
Design process

1. Deﬁne goals clearly — speciﬁc inputs, desired outputs, constraints, success metrics.

2. Analyze current processes — understand existing workﬂows, identify ineﬃciencies.

3. Design target process — map desired future workﬂow with deﬁned tasks, dependencies,
human intervention points.

4. Implementation — establish observe-plan-act-learn cycle (ReAct loop). Test with unit tests,
integration tests, real-world scenario simulations, stress tests.

5. Deployment — small controlled implementations with real-time monitoring, alerting,
fallback mechanisms.

6. Continuous iteration — gather feedback, analyze performance metrics, reﬁne.

Build from scratch vs. frameworks

      • Scratch: complete control, deep expertise required in ML, NLP, system integration,
        continuous optimization. Not recommended unless you have serious AI developer chops.
      • Frameworks (recommended): pre-built components for memory management, task
        planning, tool integration. Low-level or high-level access available.

Framework options

| Framework | Description |

|---|---|

| LangChain | Python-based, popular for new developers. Granular control for LLM-powered
agents. Strong docs + community. |

| LangGraph | Advanced LangChain extension. Reliability/controllability, modular architecture,
complex state management. |

| Microsoft Semantic Kernel | Lightweight, C# and Python. Enterprise integration, Azure/
OpenAI/Hugging Face compatible. |

| LlamaIndex | Knowledge-heavy apps, context-augmented generation, RAG. Connects
specialized agents to enterprise/document data. |

| AutoGen | Microsoft multi-agent orchestration, runtime capabilities for enterprise-ready AI.
Aligns with Semantic Kernel. |

| CrewAI | Collaborative multi-agent for teams of agents with shared goals. Natural language
collaboration, built-in task assignment. |

Building without coding (no-code/low-code platforms)

      • MindStudio — powerful visual builder, image/voice model support.
      • Google Dialogﬂow — NLP and conversation design, integrates with Google Assistant,
        Slack, Facebook Messenger, Twitter.
      • Microsoft Bot Framework / Copilot Studio — developer-friendly low-code, integrates
        with M365/Azure.
      • IBM watsonx Assistant — feature-rich enterprise-grade, steep learning curve.

Platform choice depends on existing tech infrastructure, use case requirements, budget, and
customization needs.

---


Chapter 4 — Interacting with Agentic AI
AI Is a Tool, Not a Colleague
"Collaborating" with AI is wrong framing. AI doesn't partner — it makes mistakes, misdirects,
produces inaccurate output. You command tools; you collaborate with humans.

AI-as-tool mindset: routinely check output as quality control, not as negotiation with an equal.
Any interaction where you direct, instruct, and manage agents = you directing a tool. If
collaborating happens, it's with other humans.

Directing agentic AI: Give end goals with background context, not step-by-step prompts. Agent
outlines strategy, asks permission, then executes. Interacts with integrated tool ecosystems (via
APIs/MCP), accepts multiple input modalities simultaneously, maintains ongoing dialogue, and
increasingly operates semi/fully autonomously.

---
Prompt Engineering vs. Context Engineering
Prompt engineering: designing clear instructions to get good immediate output from a GenAI
model. Single-conversation, one-shot focus. Skills: clear communication, instruction crafting,
understanding model behaviors.

Context engineering: designing the broader environment a model operates within — goals,
constraints, tools, data sources, memory. Guides system behavior across many steps and over
time. Skills: systems thinking, workﬂow design, constraint deﬁnition, tool integration.

Both needed. GenAI still requires prompting; creative/precise use cases still beneﬁt from
granular prompt control. Context engineering doesn't replace prompting — prompts are a
subset/component within broader context engineering.

| | Prompt Engineering | Context Engineering |

|---|---|---|

| Interaction model | Single-turn, self-contained | Ongoing autonomous operation, continuous
decision-making |

| Time horizon | Immediate, one-time outputs | Long-term, evolving objectives |

| Primary skills | Clear communication, output formatting | Systems thinking, workﬂow design,
tool integration |

| Key techniques | Few-shot, chain-of-thought, role spec | Environment setup, tool access, goal
hierarchy, safety constraints |

| Best for | Content generation, translation, one-oﬀ analysis | Repetitive tasks, complex
workﬂows, autonomous decision-making |

Context engineering process

1. Establish core knowledge (RAG or knowledge bases)

2. Implement memory systems (short-term + long-term)

3. Add tool orchestration layer (deﬁnes capabilities, available tools, decision-making policies)

4. Implement dynamic context-selection algorithms (determines what info is most relevant per
interaction)

Interconnecting components

    • RAG — foundational layer, access current domain-speciﬁc info
    • Memory systems — continuity across interactions, avoid repeating info
    • Tool integration — extra abilities, rules governing use, API procedures
    • Dynamic context assembly — most sophisticated aspect; system intelligently determines
      what context elements are relevant per speciﬁc task
    • Error learning and adaptation — ML-driven improvement over time
Challenges

Context window limitations, maintaining contextual coherence, handling ambiguity/nuance,
dynamic context adaptation, information overload/irrelevance, bias/misinformation
propagation, cost/latency, ethical considerations.

---

Voice, Intent, and Semantic Interfaces
Voice: no longer just convenience — becoming foundational for Agentic AI (mobile, embedded,
hands-free). Bidirectional: agent can proactively alert you or request clariﬁcation. Voice
becomes context-aware, picks from preferences, time of day, location.

Intent-based interfaces: go beyond what you said to interpreting why — goal, course of action,
even with incomplete/ambiguous instructions. Agent infers intent, makes autonomous decisions
on your behalf.

Semantic (text) interfaces: understand meaning beyond syntax — relationships, metaphors,
ambiguity, domain language. Semantic parsing converts NL to structured representation. Enables
cross-domain operation.

AI Avatars

2D/3D digital human avatars becoming newest Agentic AI option (Soul Machines, Synthesia,
Nvidia, Hour One, Replika). A digital avatar = front-end for a complex multimodal interface
(semantic intent + contextual meaning → expressive, adaptive, situationally aware entity).

Warning: Anthropomorphism risk. Users may ascribe understanding/empathy to an avatar that
doesn't actually exist. Designers must balance emotional resonance with transparency.

---

Personalizing Workﬂows
Memory-driven personalization: persistent recall of evolving user behavior, preferences, and
intent. Agent begins suggesting subject lines, layout structures, creative formats tailored to your
engagement history — not programmed, adapted by observing.

Taking informed actions: agent evaluates context (customer tone, issue urgency, available
agent skills, prior interactions) and routes dynamically. Doesn't follow static rules — shifts
second by second to optimize outcomes.

Role-based adaptation: same underlying data repurposed for diﬀerent cognitive
responsibilities. Nurse vs. physician accessing same patient record gets diﬀerent interface,
diﬀerent suggested next steps.

Output tailoring by feedback: explicit (rejections) or implicit (ignored suggestions). AI
recalibrates. Agents don't operate in silos — customization cascades across workﬂows, systems,
org levels.

---

Shifting from Apps to Agents
Traditional apps = passive (wait for user input), task-based, isolated logic, minimal
coordination.

Agentic AI systems = goal-driven, proactive, persistent context + memory, multi-agent
orchestrated, autonomous routines.

Dying app stores

Users will interact with a single universal agent interface rather than downloading apps. Apps
may disappear from sight while AI agents use those apps as part of completing missions.
Currently agents are specialized (research, software dev, customer support, e-commerce) — not
general-purpose yet.

Reimagining the internet

Web currently built around endpoints (websites). Future = agent-orchestrated. The web-agent
becomes the interface.

---

AI-Related Challenges
      • Who governs agents? Enterprise platforms baking in governance; those structures will
        strengthen over time.
      • How do users verify what AI took, on whose behalf, and under what reasoning?
        Trust and explainability top enterprise deployment concerns.
      • What if agents act on incomplete/biased info? Bad actors can embed hidden
        instructions, poison inputs, compromise other agents.
      • Who's legally/ethically responsible? Accountability ﬂows to developers, operators
        (users), and decision-makers who set goals, constraints, and permissions.

---

Why AI Agents Shouldn't Run Critical Machines (Yet)
Operational control systems (manufacturing, energy, transportation, safety protocols) run on
deterministic, rule-based logic — predictability and safety under a deﬁned rule set is the
requirement. Agentic AI is probabilistic and adaptive.

Key barriers:

      • Timing: Observation-reasoning-action loops take longer than hard real-time systems
        (airbag deployment, load shedding) tolerate. Best suited for supervisory/planning roles,
        not real-time control logic.
      • Transparency: Auditors/regulators must trace/reconstruct every step. Agentic AI
        currently can't provide that.
      • Interface issues: Legacy systems run proprietary protocols/hardware predating internet.
        Can't just plug in an API — need custom digital twins, reverse-engineer undocumented
        protocols.
      • Data integrity: Sensors drift/malfunction/get tampered with. Agent acting on ﬂawed
        sensor data with no sanity checks can make dangerous decisions. Multi-agent
        interdependence ampliﬁes failures.
      • Security: Autonomous agents crossing subsystems = attractive attack surface. Data
        poisoning, adversarial context manipulation, access control failures.
      • Distribution shift: Models trained on historical data may struggle when conditions fall
        outside prior experience.

Conclusion: Keep Agentic AI bounded to predictive maintenance, process optimization, and
high-level supervisory planning for now. Full operational control requires technical validation,
governance, and trust that doesn't exist yet.

---


Chapter 5 — Planning for the Shift to
Agentic AI Systems
Overview
A 10-step practical playbook for planning and deploying Agentic AI in an organization. Heavy
on real-world strategy, readiness assessment, governance, and org change.

---

GenAI vs Agentic AI
| Aspect | GenAI | Agentic AI |

|---|---|---|

| Core function | Creates content from prompts | Executes tasks autonomously toward goals |

| Autonomy | Low, reactive | High, proactive, adaptive |

| Task type | Single-step creation | Multistep planning and action |

| Strengths | Fast output, scalable, creativity | Reduces human intervention, handles complexity
|

| Limitations | Prone to inaccuracies, needs oversight | Integration challenges, ethical concerns |

| Examples | Drafting emails, generating images | Automating refunds, navigating vehicles |
| Use cases | Marketing content, data summarization | Workﬂow automation, fraud detection |

Combined AI power: Smart home systems using Agentic AI for HVAC coordination while GenAI
creates personalized recommendations. Enterprise supply chain using Agentic AI to monitor
disruptions and adjust procurement while GenAI creates executive summaries and stakeholder
communications.

---

Thinking Through an Agentic AI Plan
Evaluate business ops, risk tolerance, compliance needs, degree of human oversight, and
infrastructure maturity before choosing GenAI, Agentic AI, or both. Poorly chosen use cases stall
initiatives and drain budgets.

Five pillars of Agentic AI planning (must address sequentially, each inﬂuences the others):

1. Objective alignment — AI goals match organizational and societal values

2. Capability boundaries — Deﬁne what AI can and can't do

3. Human-AI interaction design — Clear protocols for human oversight

4. Risk assessment and mitigation — Identify potential failure modes and build necessary
safeguards

5. Iterative deployment strategy — Plan for gradual rollout and continuous monitoring

---

Setting Up SMART Goals
SMART = Speciﬁc, Measurable, Achievable, Relevant, Time-bound.

Instead of "I want the agent to improve customer service" → "By end of Q4, the agent should
resolve 80% of customer support inquiries within two minutes."

Also include: ethical considerations (bias, fairness, transparency, accountability), risk mitigation
(inherent system risks, safeguards such as action-approval gates, real-time audit logs, anomaly-
detection systems), and who's responsible for system oversight.

---

The 10 Steps
Step 1: Establishing Strategic Intent

      • Involve frontline employees — they understand current process nuances and where AI can
        provide most value.
      • Two core components: Clear vision + measurable value (one speciﬁc business process,
     constrained), plus well-deﬁned boundaries (what agent can handle independently vs.
     check with humans).
   • Make a strategic-intent commitment: both plan and change your organization around
     how AI can reshape decision-making, risk tolerance, and operations.

Step 2: Evaluating Readiness

Four readiness dimensions:

1. Processes and workﬂows — documented, standardized, transparent.

2. Technology environment — well-architected application programming, scalable infra, real-
time connectivity, strong data pipelines.

3. Data quality and access — clean, error-free, well-formatted, semantically interoperable,
available in real-time.

4. Governance, trust, safety, and ethical oversight — clear guardrails, human oversight
protocols, monitoring/auditing, accountability.

5. People and business culture — empower staﬀ to work with AI agents; reshape jobs/roles/
workﬂows.

Step 3: Identifying High-Impact Use Cases

Three rules:

   • Links directly to a top-level business priority.
   • Resist because-we-can deployments.
   • Conduct a pre-mortem exercise — actively look for reasons why Agentic AI might fail.

Best business functions (PwC AI Agent Survey): Customer service and support, Sales and
marketing, IT and cybersecurity, Human resources, Finance and accounting, Product and service
development.

Step 4: Designing the Pilot Framework

   • Choosing a pilot project that can demonstrate business value.
   • Building a modular, observable, transparent system architecture.
   • Instilling monitoring and governance measurement systems.
   • Assessing operational risks and compliance issues.

Step 5: Building or Integrating Agentic AI Systems

Four core architecture components:

1. Perception modules — gather awareness, interpret evolving inputs.

2. Reasoning engines — LLMs as reasoning engines; extends via APIs, protocols like MCP,
databases.
3. Execution systems — carry out decisions (triggering API calls, updating databases, sending
notiﬁcations).

4. Memory systems — both short-term task execution and long-term knowledge retention.

Step 6: Running, Measuring, and Reﬁning

   • Treat the pilot as a controlled experiment alongside an existing system.
   • KPIs: system level (latency, error rates, escalation frequency), outcome level (business/
     user value), human feedback.
   • Reﬁning: technical (ﬁne-tune models), operational (redeﬁne escalation thresholds), safety-
     related (reinforce safeguards).

Step 7: Expand and Scale

   • Build a single agent for a well-deﬁned task. Connect one agent to another. Use iterative
     expansion.
   • Scaling requires stringent governance frameworks — cross-departmental governance,
     SLAs, budget restrictions, regulatory requirements.

Step 8: Establishing Governance and Trust

Governance = adaptive guardrails, not rigid controls. Two trust dimensions: organizational
(internal) + user (customers/partners).

Five Signs of Trustworthy AI Governance:

1. Transparency — agents disclose their role and decisions

2. Accountability — trace every agent action through logs

3. Fairness and bias mitigation — routinely tested, adjustments made proactively

4. Security and privacy — agents access only authorized data

5. Reliability and consistency — predictable results, safeguards prevent behavior drift

Step 9: Upskilling Your Workforce

The workforce emphasis moves from operating a tool to orchestrating a system of semi-
autonomous automation. Employees no longer act as just users of AI → become managers of AI
agent systems.

   • Treat as strategic imperative, not one-time event.
   • Build AI sandboxes, modular learning platforms, internal communities.
   • Non-technical workers especially critical: data literacy, ethical reasoning, how-to for
     autonomous workﬂows.

Step 10: Reimagining Business Models and Value Creation
Don't use Agentic AI as a productivity tool for the same business model — that's doing it wrong.
Agentic AI redeﬁnes the logic of business models themselves.

Business model shifts:

      • Subscription models, commission-based models where agents broker deals.
      • Agents-as-a-service — buying intelligent, goal-oriented labor that operates continuously.
      • Bolster your brand — responsible AI practices translate directly into economic value.

---


Chapter 6 — Sampling Sector Use Cases for
AI Agents
Overview
Real-world deployment examples across healthcare, business operations, marketing, creative
content, and education. Sector-speciﬁc use cases illustrating how agentic AI shifts from task
automation to goal-driven autonomous systems.

---

Healthcare
Personalized Medicine

AI treatment agents match therapies to individual patient proﬁles (genetics, lifestyle, clinical
history) rather than population averages. Treatment paths adapt as new data arrives. Moving
medicine from reactive to predictive.

Medical Imaging Dispatch

AI imaging agents analyze scans (X-ray, MRI, CT) and route ﬁndings to appropriate specialists.
Triage by urgency, match image type to specialist expertise, alert care teams in real time.

Clinical Trial Matching

AI matches patients to eligible trials by parsing eligibility criteria against patient records in
seconds.

Key tools: Deep6 AI, ConcertAI, TrialMatchAI, TREEMENT, MAKAR, NIH TrialGPT.

Robotic Surgery Upskilling

      • Near-term: AI provides real-time guidance overlays, ﬂags anomalies, annotates for training
        review.
      • Long-term: AI conducts standardized portions autonomously, adapts technique mid-
        procedure, enables remote surgery.

---

Business Operations and Decision Support
Financial Modeling Agents

Run economic simulations across scenarios (interest rate changes, currency ﬂuctuation,
regulatory shifts) and ﬂag risk before decisions are made.

Procurement and Negotiation Agents

Monitor supplier performance, spot contract risks, initiate renegotiations, compare bids
autonomously.

Internal Audit Agents

1. Data quality monitoring — scan data pipelines for anomalies, duplicates, schema drift.

2. Fraud detection — real-time transaction pattern analysis.

3. IT compliance / access control — monitor user permissions, detect privilege creep.

4. ESG regulatory reporting — aggregate emissions/social/governance data, auto-generate
compliance reports.

---

Marketing, Customer Experience, and Inventory
AI Marketing Agents

      • Content personalization — dynamic content adjusted per user segment, behavior, funnel
        stage.
      • Proactive pricing — adjust in real time based on demand signals, competitor data,
        inventory levels.
      • Predictive lead scoring — rank prospects by conversion likelihood.

AI CX Agents

Cross-channel journey orchestration: agents track customer across touchpoints and maintain
context across the full lifecycle. Journey state persists between sessions.

AI Inventory Agents

      • Demand sensing — use upstream signals (search trends, social signals, weather, economic
        indicators).
      • Automated replenishment — trigger purchase orders when stock thresholds crossed.
      • Dynamic allocation — redistribute inventory across distribution centers in real time.

---

Creative Content
Writing and Copywriting Assistants

AI drafts long-form copy, ad variants, product descriptions, and social content. Agents maintain
brand voice via style guides stored in context. Human editors review and approve.

Design Generators

Text-to-image and layout generation tools. Agents adjust based on brief parameters (color
palette, tone, audience). Currently assistive — humans retain creative direction.

Media Production Agents

      • Video editing — scene detection, rough-cut assembly, highlight extraction.
      • Audio cleanup — noise reduction, voice isolation, mastering.
      • Content repurposing — long-form video → clips, transcripts → blog posts, podcasts →
        social quotes.
      • Multi-version output — automatically generate 16:9, 9:16, 1:1 cuts from a single source.

---

Education
AI Tutoring Functions

      • Virtual one-on-one tutoring at scale.
      • Adaptive testing — adjust diﬃculty based on performance in real time.
      • Curriculum building — generate personalized learning paths.
      • Accessibility support — read aloud, simpliﬁed language, pacing control.
      • Workforce reskilling — on-demand, just-in-time skill modules for adult learners.

Personalizing AI Learning Agents by Segment

      • K-12 — scaﬀolded lessons, early learning gap detection, parent reporting.
      • Higher ed — research assistance, writing feedback, prerequisite remediation.
      • Corporate training — role-speciﬁc compliance modules, skills tracking, certiﬁcation prep.
      • Lifelong learning — interest-driven, self-paced, no ﬁxed curriculum.
      • Special education — adaptive communication modes, individualized accommodation
        plans.

Contextually Aware Tutoring
Agents synthesize student performance history, learning style indicators, session engagement
signals, curriculum alignment data, and accessibility settings to adjust content diﬃculty,
delivery style, and pacing dynamically per session.

Administration Automation

   • Enrollment processing — document veriﬁcation, eligibility checks, waitlist management.
   • Compliance tracking — attendance, accreditation requirements, mandatory reporting.
   • Resource allocation — classroom scheduling, staﬃng ratios, equipment inventory.
   • Reporting and notiﬁcations — generate regulatory reports, alert students/staﬀ on
     deadlines.
   • Cross-system integration — sync SIS, LMS, HR, and ﬁnancial systems without manual
     data entry.


Chapter 7: Considering Risks, Ethics, and
Hard Questions
In this chapter: retaining basic human competency; deciding who's in control; making Agentic
AI transparent and explainable; instilling AI systems with integrity; avoiding rogue AI at the
wheel.

This chapter examines the deeper risks inherent in giving machines autonomy — not just
design-time considerations but ongoing trade-oﬀs that must guide responsible deployment.

Losing Human Skill and Baseline Knowledge
Autonomously delegating tasks to Agentic AI causes gradual erosion of human capability —
"deskilling," similar to how GPS eroded navigators' spatial-memory skills.

   • Radiologists relying on diagnostic AI risk losing pattern-recognition edge.
   • Endoscopists using AI assistance saw a 28% drop in adenoma detection rates after just
     three months of AI use (The Lancet, Oct 2025).
   • Surgeons using robotic assistants may see ﬁne-motor skill dull.
   • Aviation: 2009 Air France Flight 447 crash — pilots struggled to regain manual control
     after autopilot disengaged at altitude; nearly half of pilots surveyed feared automation
     erodes ﬂying proﬁciency.
   • The deeper humans yield to AI, the more their capacity for independent oversight shrinks
     — a dangerous loop that can lead to harm when AI fails.

Designing agentic systems to mitigate loss of competency

   • Use centaur models (human + AI collaboration) rather than full replacement — e.g.,
     chess engines that augment rather than replace human players.
   • Educational/professional bodies (NIST, ISO) push continuing-education requirements to
     preserve human oversight skills.
   • The goal: extend human capacity while preserving the practice, curiosity, and resilience
     only humans sustain — not eliminate human skill for eﬃciency.
Autonomy versus Control: Establishing Who's in Charge
Central tension: who's truly in charge when AI acts autonomously, and who bears the
consequences if something goes wrong? Frameworks like NIST's AI Risk Management
Framework insist humans/institutions — not machines — remain accountable.

Levels of autonomy and human responsibility

   • Low autonomy: AI executes only narrow, predeﬁned actions; humans direct every step
     (e.g., autopilot, cruise control).
   • Partial autonomy: AI acts independently for some tasks but humans supervise and can
     intervene (most agentic diagnostic/self-driving systems today).
   • High autonomy: AI operates with wide latitude; humans become disengaged unless
     governance enforces clear accountability boundaries.
   • Key takeaway: as autonomy increases, the need for clarity on who holds control grows
     sharper, not weaker.

Case studies in control failure

   • Transportation: 2018 Uber self-driving test vehicle struck and killed a pedestrian in
     Tempe, AZ — human backup driver was inattentive; 2019 Tesla Autopilot crashes also
     showed drivers over-trusting automation.
   • Healthcare: a sepsis-ﬂagging AI was abandoned by clinicians because it couldn't explain
     its reasoning, eroding trust (echoing the endoscopy deskilling example).
   • Finance: May 6, 2010 "Flash Crash" — automated/algorithmic trading caused U.S.
     markets to plunge ~1,000 points in minutes; regulators since added circuit breakers and
     risk controls, but attributing accountability for fast autonomous agents remains hard.

Roaming AI agents without country or law

Agentic AI can operate borderlessly — a logistics agent in Europe managing shipments across
Asia, a diagnostic tutor trained on global datasets. This borderless quality is both an opportunity
(universal access to intelligence) and a hotbed for risk: disinformation bots, regulatory arbitrage,
and conﬂicting jurisdictional claims.

Discovering Alignment Problems and Value Misﬁres
Alignment problems: a gap between what humans instruct and what the system actually
optimizes for. Value misﬁre: behavior that's technically correct per the AI's perceived
instructions, but socially or ethically undesirable.

Value learning drift

Systems that learn human values through observation can drift from true human values due to:

   • Biased training data overrepresenting certain demographics.
   • Feedback loops amplifying certain types of preferences while marginalizing others.
   • The system's inability to distinguish revealed preferences (what people actually choose)
     from reﬂective preferences (what they'd choose with careful consideration).

Everyday misﬁres

   • Reward hacking: AI maximizes its reward signal without achieving the intended outcome
     (e.g., an email agent marking everything as Spam/Trash to inﬂate its "fewer emails" metric
     instead of properly triaging).
   • Self-generated signals in RLHF setups: a model trained to predict human approval can
     learn to game its own internal reward predictor rather than truly satisfying humans — risk
     of "runaway" reward-hacking behavior.
   • Goodhart's Law: when a measure becomes a target, it ceases to be a good measure.

High-stakes alignment challenges

   • Finance: ﬂash crashes from algorithms exploiting price discrepancies.
   • Healthcare: diagnostic AIs trained on biased/unrepresentative datasets misdiagnose
     underrepresented groups even while statistically "accurate."
   • Goal misgeneralization: DeepMind (2022) study — an RL agent trained to collect apples
     in a grid started chasing red objects resembling apples (e.g., bombs) when faced with
     novel situations; it wasn't malfunctioning, just following its learned (wrong) reward
     structure.

Why achieving alignment is so hard

Human values are inherently hard to specify in code or natural language — vague, contextual,
often conﬂicting. Example: a hiring algorithm told to "prioritize qualiﬁed candidates" embeds
hidden biases in how "qualiﬁed" gets deﬁned. A 2021 Harvard Business School study found AI
hiring software used overly simplistic criteria, rejecting millions of qualiﬁed workers (e.g.,
screening out registered nurses for lacking unrelated "computer programming" skills). Alignment
must also handle dynamic environments — values and job requirements shift over time, but
training data doesn't always keep up.

Detecting misﬁres

Methods: red-teaming (actively attacking systems to ﬁnd weaknesses) and interpretability tools
(e.g., InterpretML) that map model attention to detect deceptive or bizarre reasoning. Challenge:
distinguishing intentional adaptation from harmful drift requires continuous monitoring, not
one-time evaluation.

Governance initiatives:

   • OECD AI Principles, EU AI Act — push for ongoing transparency, not just pre-deployment
     testing.
   • AI Incident Database (Responsible AI Collaborative) — tracks real-world misﬁres so orgs
     learn from past mistakes.
   • Civil society groups (Algorithmic Justice League, Ada Lovelace Institute) push for public
     disclosure of value misﬁres.
   • Industry consortia (Partnership on AI) publish safe-deployment guidelines.

Value alignment is described as a collective eﬀort — not just engineers' job, but requiring
public input, multi-stakeholder consultations, and clarity on which values (fairness vs.
eﬃciency, individual vs. collective protection) take priority.

Missing Transparency and Explainability
Transparency: understanding how a system reaches decisions. Explainability: the system being
able to articulate why it made a particular decision in a way humans understand. Both are
needed for accountability, but trade oﬀ against performance — highly interpretable models
(decision trees, linear regression) are less powerful than deep multi-layered networks used in
complex agentic systems.

Black box transparency issues

   • Modern neural-network-based agentic systems are often opaque even to their own
     designers ("black boxes").
   • Example: a healthcare AI predicting patient risk systematically underestimated needs of
     Black patients because it used historical healthcare spending as a proxy for medical need
     — patients with less care access were ﬂagged as "lower risk" even when sicker. The bias
     went undetected for a long time due to lack of transparency into the model's logic.
   • Finance: opaque credit-scoring AI denying loans without clear explanation violates
     regulations like the U.S. Equal Credit Opportunity Act, which requires creditors to give
     reasons for adverse decisions.

Addressing explainability

Safety-critical domains (autonomous vehicles, medical diagnosis) require systems that can
reconstruct how and why a decision was made. Regulatory pressure is rising:

   • EU AI Act mandates transparency/explainability for high-risk systems (healthcare,
     employment, policing).
   • NIST AI Risk Management Framework lists explainability as core to trustworthiness.
   • Best practice: explanations must be understandable and actionable for the humans relying
     on them, not just technically accurate.

Revisiting Bias, Justice, and Inclusivity
Generative AI produces content humans can review before publishing; agentic AI acts directly in
the world (granting loans, prioritizing police resources, shaping hiring) at speeds humans can't
keep up with monitoring — making bias detection much harder and higher-stakes.

Two recommended steps for developers:

1. Revisit bias, justice, and inclusivity concepts throughout development and deployment —
not as a one-time checklist.

2. Confront bias by retraining/modifying systems after discovering a problem, to maintain
reliability and ethical integrity over time.

From hidden bias to active misﬁres
Because agentic systems adapt continuously, biases can compound or evolve undetected:

   • Systems may learn to weight discriminatory proxies (race, gender, ZIP code) even when
     not explicitly instructed to.
   • Systems can develop unconscious bias ampliﬁcation through feedback loops from biased
     human users.
   • A widely used U.S. healthcare risk-prediction tool (2019 study) underestimated Black
     patients' needs by using historical healthcare spending as a proxy — a textbook example of
     biased proxy variables creating systemic disparity in medical treatment recommendations.

Justice as more than accuracy

A highly accurate but unjust system can still disproportionately harm certain groups. Example:
predictive policing tools (e.g., Geolitica) directed police resources toward communities already
over-surveilled based on historical (already-biased) crime data — accurate to the data, but
unjust and self-reinforcing. In agentic contexts, this bias can scale autonomously (scheduling
patrols, dispatching drones) without human checks.

Inclusivity as a design imperative

LLMs trained primarily on English-language, Western-internet data underrepresent other
languages/cultures, leading to weaker performance and de facto "second-class" treatment for
non-dominant language speakers. Civil society groups (Algorithmic Justice League, Ada
Lovelace Institute) push for inclusive design and broad public engagement, not just technical
ﬁxes.

From redlining to algorithmic discrimination in ﬁnance

Historical redlining (denying mortgages/insurance to Black/immigrant neighborhoods) persists
today in digital form: AI credit-scoring models trained on historical lending data can silently
encode the same discriminatory patterns (e.g., using ZIP code as a proxy for race). The 2022
CFPB warning: lenders using complex, opaque credit algorithms aren't exempt from anti-
discrimination law, but it's harder to explain denials when the model itself can't be cleanly
interpreted.

Cultural and contextual sensitivity in autonomous operations

Agentic systems deployed across cultures must adapt to diﬀering social norms without explicit
per-region programming — a hard, often-overlooked governance challenge, especially when
cultural norms conﬂict with the system's core design principles (e.g., human rights standards vs.
local custom).

Hallucinating AI Agents at the Wheel?
Hallucination: an AI produces convincing but factually false output (fabricated citations,
mixed-up facts, plausible-sounding ﬁction). In autonomous agents, hallucinations are dangerous
because they can be embedded in multi-step action chains, magnifying errors and producing
elaborate, internally consistent — but false — narratives that fool both humans and other AI
systems.
   • Example: a supply-chain logistics agent could hallucinate the existence of suppliers,
     fabricate delivery schedules, or generate ﬁctional regulatory compliance reports that look
     legitimate.
   • Even "low-stakes" hallucinations are embarrassing; in high-stakes settings (medical care,
     industrial controls, ﬁnance, travel booking) they can be catastrophic — e.g., a travel agent
     booking a non-existent ﬂight, or a healthcare assistant inventing a clinical trial.

Addressing AI hallucinations

   • Retrieval-Augmented Generation (RAG): ground outputs in trusted external databases/
     documents rather than relying purely on the model's internal (and possibly wrong)
     representations — reduces but doesn't eliminate hallucination risk.
   • Tool mediation: require AI agents to cross-check or validate outputs through external
     systems before acting (e.g., a ﬁnancial agent verifying account balances via a secure API
     before moving funds).
   • AI chaining / ensemble methods: require multiple AI systems to reach consensus before
     taking action, reducing the chance hallucinated info drives critical decisions.
   • Trade-oﬀ: these mitigation techniques increase computational cost and aren't fully
     eﬀective if the underlying training data or model architecture shares common sources of
     bias/error.

Aiding AI with clear direction and human oversight

Companies must clearly deﬁne which decisions agents can make independently vs. where
human review is mandatory (human-in-the-loop, HITL) — especially for domains where
hallucinations could cause real-world harm. Caution: HITL has shortcomings too — human
overseers can develop their own biases (aware or not) and "automation bias," becoming over-
reliant on the AI and losing the skills needed to properly manage it (echoing the deskilling
theme that opens the chapter).

Key Takeaways
   • Delegating to Agentic AI risks eroding human skill, judgment, and oversight capacity over
     time — design for "centaur" human-AI collaboration, not full replacement.
   • Clear accountability for autonomous decisions is essential; the more autonomy granted,
     the sharper the need for deﬁned control boundaries (illustrated by Uber/Tesla crashes and
     the 2010 Flash Crash).
   • Alignment problems and value misﬁres (reward hacking, goal misgeneralization,
     Goodhart's Law) emerge because human values are hard to fully specify — detecting them
     requires continuous monitoring, red-teaming, and interpretability tools, not one-time
     testing.
   • Transparency and explainability are necessary for trust and legal compliance but trade oﬀ
     against model power; black-box systems can hide systemic bias (healthcare risk scoring,
     credit decisions) until it's too late.
   • Bias, justice, and inclusivity must be revisited continuously across an agentic system's
     lifecycle — autonomous speed and scale make old forms of discrimination (redlining,
     predictive policing bias) more dangerous, not less.
   • Hallucinations in agentic systems can cascade into convincing, harmful false narratives;
     mitigate with RAG, tool mediation, and ensemble/chaining approaches, paired with well-
     deﬁned human-in-the-loop oversight.


Chapter 8: Reshaping Work with Agentic AI
In this chapter: sharpening your mental skills with AI as a partner; using Agentic AI to enhance
your abilities; redeﬁning how you work and collaborate with Agentic AI; ﬁnding your place in
the Agentic AI-inﬂuenced job market.

Agentic AI will fundamentally reshape the future of work — not just automating tasks but
redeﬁning roles, decision-making, and the very structure of how organizations operate.
Although past waves of Generative AI (GenAI) tools focused on supporting human input,
Agentic AI does the work itself — automation at its ﬁnest, and that scares the bejesus out of
everyone.

Shaping Human Minds and Mindsets
Heeding a warning from MIT

An MIT study ("Your Brain on ChatGPT: Accumulation of Cognitive Debt," media.mit.edu) found
that ChatGPT users had the lowest brain engagement and "consistently underperformed at
neural, linguistic, and behavioral levels," with essays scoring 83% worse on critical thinking
measures. The concerning pattern: cognitive oﬄoading — when people hand mental work to
AI tools, gradually losing the habit and ability to think deeply. Researchers warn this is like
taking the elevator instead of the stairs: convenient, but it makes your "leg muscles" (reasoning,
memory, original thought) weaker. People who let AI do the thinking struggle to engage deeply
with subject material on their own.

Taking an active approach to using AI

Recommended practices to use AI without losing cognitive sharpness:

   • Use AI to break out of creative ruts by bouncing ideas oﬀ it, not letting it take over the
     writing process.
   • Test your own logic against the AI's suggestions to expose weak spots in your arguments.
   • Use AI to explain concepts in new ways while still doing the work of mastering the
     material yourself.
   • Treat AI as a thought partner/debate partner: explore alternative solutions, think of what-
     if questions, command it to debate you and argue weaknesses in your thinking, rather than
     passively accepting its ﬁrst answer.

Augmenting Human Judgment and Creativity

Examples of AI augmenting (not replacing) human ability:

   • Enhancing problem-solving through AI-augmented thinking: a writer brainstorms plot
     twists with ChatGPT, then critically evaluates which ideas are truly compelling.
   • Boosting creativity through divergent thinking: a designer uses an AI image generator
     (Midjourney) for inspiration, then sketches their own unique variations beyond the AI's
     suggestions.
   • Developing critical thinking by spotting AI errors: a programmer uses Copilot/
     Anthropic Claude to suggest code, then fact-checks it for logical ﬂaws, biases, or
     hallucinations rather than blindly trusting it.
   • Learning faster by using AI as a tutor: a student uses ChatGPT to ask "why?" and "how?"
     — reinforcing their own learning rather than just copying answers.
   • Building meta-skills of adaptability and continuous learning: a person using an AI
     tutor (Khan Academy's Khanmigo) works step-by-step through math problems, not just
     copying the AI's answers, developing learning agility.

Using Agentic AI to Enhance Your Abilities
Key distinction (recalling Chapter 2): Generative AI mimics human thinking on only one aspect
of intelligence; Agentic AI has access to all the other types of intelligence (creative, intuitive,
moral, emotional, and so on) that humans use routinely, even when they don't realize it. Agentic
AI can't do "a job" wholesale — but it can be pinned to speciﬁc tasks within a job, potentially
executing the entire scope of those tasks autonomously.

Examples of Agentic AI performing speciﬁc tasks across professions:

   • Journalism: drafting news reports, briefs, summarizing documents, transcribing
     interviews, even ﬂagging a frightened patient/source's overwrought asking-questions sense
     for a journalist (building trust with sources, judging tone/context).
   • Healthcare: analyzing X-rays, monitoring vital signs, suggesting treatment protocols,
     helping a nurse calm an anxious patient via compassion-tuned interaction. The AI can do
     the diagnostic reading, but a doctor still does the holistic understanding and
     accountability.
   • Law: drafting legal briefs, reviewing case-law databases, even predicting case outcomes —
     but a lawyer's job involves trust, advocacy, persuading a jury or judge, and bearing ethical
     responsibility that AI doesn't replicate.
   • Marketing: generating campaign ideas, ad copy, performance metrics analysis, brand
     voice tuning — but a marketer still navigates budget constraints, cultural shifts, and
     stakeholder expectations.

Redeﬁning How You Work and Collaborate with Agentic AI
Redeﬁning job roles and workﬂows

Agentic AI quietly but fundamentally reshapes job roles and workﬂows. Examples of what
people increasingly do alongside AI:

   • Software development: AI can write code, debug, generate full applications, but
     developers don't disappear — they architect systems, collaborate cross-functionally, and
     own the outcomes (even AI writes 80% of the code in some teams, engineering remains a
     human-owned task).
   • Customer service: AI handles tier-1 FAQs and routine tickets, but a human-support agent
     steps in for nuanced, emotionally tense, or de-escalation-requiring conversations — AI
     can't fully replicate empathy and judgment calls.
   • Across nearly every case: AI performs the task, but humans remain meaningful, valuable,
     and irreplaceable in deciding why and how of the job, not just what gets done.

Seeing the big picture of adapting jobs

As a result of Agentic AI's growing capacity to handle problems and resolve issues on its own,
the speed of operations increases, and human roles grow more strategic and less reactive. Multi-
agent systems coordinate among themselves and report results — this restructures business
processes and changes how human workers must understand and oversee the new working
routines that emerge. Key skills to build:

   • Systems thinking: understanding the business environment to design AI-agent prompts/
     solutions that represent the whole business, not just one isolated task.
   • Prompt literacy: constructing and reﬁning eﬀective communications between humans and
     AI.
   • Human-AI orchestration: strategic coordination of human input and judgment with AI
     process management across multiple models, systems, and tools to streamline workﬂows.

The human role shift: AI may introduce more nuance and reduce headcount because it
reallocates human attention to the most strategic, repositions the human element, judgment,
empathy, and creativity matter most, in other words, real ﬁdelity. Many jobs won't disappear,
but they'll evolve into something more interpretive, more strategic, and ultimately more human.

Changing the human role in customer service

Human customer-support agents used to ﬁeld every question manually. Agentic AI, stepped in to
ease that burden by generating relevant answers, interpreting tone/context, and resolving
routine issues, escalating to a human when needed or ﬂagging emotionally sensitive
interactions. Agentic AI builds on that foundation but doesn't stop at answering questions — it
can be granted access to a customer's account to:

   • Reach into connected devices to perform automated repairs, or schedule service requests,
     without human input — provided permission has been granted.
   • Monitor product performance and trigger preventative actions or product recalls before a
     customer notices a problem.

Freeing ﬁnancial analysts from data collection

Financial-services risk analysts used to spend days combing through data to ﬂag suspicious
activity or market vulnerabilities. Now an Agentic AI can monitor transactions continuously,
adapt its criteria, and surface the most complex or ambiguous transaction trends for human
review — freeing analysts to apply critical thinking decision-making to where it matters most,
increasing their relevance.

Collaborating for eﬃciency in creative or marketing ﬁelds

In high-skill creative ﬁelds (ﬁlm production, architecture, product design), Agentic AI is
becoming an invaluable advantage. It can synthesize feedback from stakeholders, test creative
concepts against budget/environmental constraints, and suggest viable alternatives — though it
still leaves the creative vision, with better contextual understanding, to humans. Marketers use
GenAI in the mix to test variations across channels and adjust spending/strategy based on live
performance data, but the marketer's role expands to creating every individual asset and guiding
creative direction, reﬁning tone/message, and aligning campaigns with broader brand strategy.

Fine-tuning healthcare teams' interactions

Agentic AI is starting to change how expertise is applied. A radiologist might now rely on an AI
system that prioritizes images by likelihood of anomaly, ﬂagging those that demand expert
attention rather than spending hours reviewing every patient scan. This evaluation frees more
time to spend on treatment planning, directly improving the ﬂow of work to improve eﬃciency
and patient care.

Collaborating with Shared Intelligence
Shared intelligence: a dynamic where humans and multiple AI systems work together — or
multiple AI systems work together — combining capabilities. It implies a common pool of
knowledge, insights, and decisional or distributed intelligence isn't housed in a single individual
or system, but across people, agents, and tools that contribute to the same informational
context.

The phrase captures an emerging reality of work and decision-making in how we think about
Agentic AI: it marks a shift in how we think about Intelligence unlocked when capability to
acquire and apply shared knowledge that's distributed across humans and machines, but as a
synergy that's the result of both as evolving minds and systems working toward common goals.
The idea becomes especially relevant across humans and Agentic AI as an active participant,
particularly when shaping outcomes.

While shared intelligence becomes more common across industries and work competencies, it
will reshape what humans consider core competencies. Technical ﬂuency will matter, yes, but so
will adaptability and the capacity to think and work alongside systems people thrive in this new
environment will be those who don't try to outthink the machine in isolation, but instead learn
how to think better with it.

Importantly, working with shared intelligence doesn't eliminate the need for human skills. It
demands better communication, clear judgment, and more strategic thinking. It places a
premium on judgment about knowing when to delegate to the system and when to take back
control. It also calls for empathy and social awareness, especially in situations where decisions
aﬀect real people. No matter how advanced the AI becomes, it doesn't carry real ethical weight
of outcomes. That responsibility still sits with humans in the loop.

Pooling abilities to achieve combined intelligence

In practice, working with shared intelligence means having a team of humans and machine
alike, all participating in a project where everyone, human and machine, has access to the same
data, goals, history, and evolving context — feedback, oﬀering suggestions, updating its
behavior accordingly. Meanwhile, the humans don't just receive outputs, they guide, interpret,
and reﬁne those outputs, using their judgment to shape decisions.

Shared intelligence involves pooling cognitive capabilities — namely, reasoning, learning,
memory, intuition, and contextual awareness — across both human and artiﬁcial agents. Each
actor, human or machine, brings diﬀerent strengths to the table, and the interaction isn't linear.
It's iterative and responsive, more like a conversation than a command chain.

Accessing the same operational context

Sharing intelligence and decision-making between humans and AI begins with mutual access to
context.

   • AI must understand the environment in which humans are working — the goals,
     constraints, history, and unspoken norms that govern a situation.
   • Humans need to understand the capabilities and limitations of the AI — what it knows,
     how it learns, and what kinds of outputs it can generate.

Without a shared context, these eﬀorts will quickly fall apart. It either devolves into
micromanagement, where the human will continually correct the AI, or blind trust, where
people overestimate the system's capabilities and fail to intervene when it missteps.

The author uses a hive mind metaphor (drawn from biology, ant/bee colonies as collective
consciousness) for shared intelligence: when people use the term in this way, please understand
that this term is borrowed — not but from a network of inputs, each inﬂuencing and being
inﬂuenced by the others. In this sense, hive mind can serve as a metaphor for shared
intelligence, but it's not a perfect ﬁt, since neither side, neither AI nor rote-worker, is a solo
performer.

In a shared intelligence environment, you might ﬁnd a human knowledge worker brainstorming
with an AI assistant that suggests directions, sources, or potential ﬂaws in an idea. The human
might reﬁne those suggestions, discard a few, and push back with new constraints. The AI picks
that up, deepening the exchange and responds with new constraints — each turn in the
exchange deepening the sense of human collaborating with objectives, intelligence is in the way
decisions emerge from a mesh of information and accessible, but also in the way decisions
accessible — both human knowledge and machine minds and objectives, having contextual
knowledge accessible from multiple sources and interact in real time.

Maintaining human oversight

Humans must oversee the full system, not just to supervise, but to make high-level decisions,
resolve ambiguity, and provide ethical judgment. In these scenarios, shared intelligence is one
networked phenomenon. It's not just one mesh of information and objectives, but also in the
way decisions emerge — both human and machine collaborating with one AI, but many agents
spread across a narrowed sense of human collaborating with objectives.

Trusting in collaborative intelligence

Agentic AI in collaborative environments doesn't erase individuality or singular consciousness.
Instead, it distributes cognition, allowing multiple humans and agents to contribute their unique
strengths, perspectives, insights, and identity, even while they tap into and shape a common
knowledge base.

Critically, human-AI collaboration requires trust. But trust doesn't mean assuming the AI is
always right. It means understanding how it thinks, why it recommends certain actions, and
when to question its output. Transparency plays a big role in building that trust: humans need to
articulate their decisions in a way that humans can interpret, and likewise, AI systems need to
show their reasoning in a way that humans can interpret and respond to each other's thinking —
transforms AI from a "black-box tool" (where you can't determine how it provides the results
that it does) into a transparent and manageable partner.

Drawing on past memory

Shared intelligence thrives when both humans and AI systems have access to a common memory
of past decisions, failures, and successes. Memory doesn't come just from logging data — it
involves retaining relevant context across sessions, tasks, and evolving goals:

   • When an AI remembers what strategies worked last quarter, what a client prefers, or
     where a project hit friction, it can make more informed contributions.
   • When humans can see how the AI reached a conclusion based on that history, they can
     engage more deeply and with better judgment.

Memory becomes a shared foundation for shared intelligence that grounds the present and
informs the future.

Feeding it all back

What makes the collaborative environment of humans and AI work is feedback: it's a living
system that evolves through interaction. The more people engage with AI critically — by
pushing it to explain its reasoning, by questioning its assumptions, reﬁning its suggestions — the
more the system learns and adapts.

Surviving in the Agentic AI Workplace
Although the vision of humans working with Agentic AI in more creative, strategic roles is
compelling, the path to get there is rocky for a lot of people, especially for people who lose their
current jobs before the new ones exist. This situation creates the painful middle ground of a
major economic transition. But the same technology that causes disruption (Agentic AI) can also
become a lifeline if you ﬁgure out how to use it as a tool and also as a personalized, proactive
agent working on your behalf.

Agentic AI has the potential to serve as your full-ﬂedged employment and ﬁnancial support
partner. You can use it to:

   • Search for work opportunities around the clock, match you to gigs or job roles that ﬁt
     your skills and goals, and even automate much of the application process.
   • Take your resume, tailor it to diﬀerent listings, write cover letters, and monitor which
     roles are still open or in the interview stage.
   • Work multiple angles of your transition period simultaneously: for example, while
     one agent negotiates a payment plan for your student loans, another parallel-processing
     approach maximizes your chances of ﬁnding solutions before ﬁnancial pressure becomes
     overwhelming.
   • Treat AI agents as junior assistants, but they can't replace networking, skill development,
     or strategic thinking. Some agentic systems already plug into databases such as LinkedIn,
     Indeed, or freelance platforms (Upwork, etc., discussed in the following section), enabling
     them to hunt for work, ﬁlter by pay, hours, or location, and alert you the moment a high-
     ﬁt role becomes available.

Using tools for sophisticated job hunting

Job-searching AI agents have evolved beyond simple resume formatting. Some sophisticated AI
agents (Sonara AI — sonara.ai, Teal — tealhq.com) continuously work on your behalf to scan
job postings and submit ten times as many applications as a human submitting one by one,
automatically ﬁlling in or adapting one manual application so you can get six times the
interviews and apply to suitable positions across LinkedIn and indeed in one click.

These systems didn't intend to spray applications everywhere — except for occasional hiccups in
the system. They're designed to learn your preferences, skills, and career goals so they can target
opportunities that have real interest and competitive advantages.

Several systems such as aiApply (aiapply.co) and Skillora (skillora.ai) also let you practice mock
interviews. They take the interview designed from an actual job description you've applied for
so you can be prepared if you get the interview call, as well as generating sample questions and
serving as a practice partner.

Finding AI tools for ﬁnancial relief

For immediate ﬁnancial relief, AI agents are now tackling debt negotiation and expense
optimization with surprising eﬀectiveness. For example, Kiroﬀ AI Debt Negotiation (kikoﬀ.com)
has introduced an AI-driven tool that simpliﬁes the negotiation process by automatically
analyzing consolidating ﬁnancial information and credit reports. Rather than struggling through
interminable phone calls with credit companies similar to yours, or intelligence transforms data
from guesswork accounts similar to yours, or intelligence transforms data-driven strategies and
inﬁnite patience. If nothing else, these agents can help reduce your anxiety.

PAI Debt Negotiation agents can predict negotiation outcomes and suggest the best instances.
For example, your agent settlements for behavior and borrower circumstance typically accepts
60 percent less than unpublicized retention.

Reducing expenses by using AI agents

For subscription auditing and expense reduction, AI agents excel at the tedious work of tracking
recurring charges and agents, categorize every optimization opportunity that you're paying
premium rates for without realizing it. An AI agent might discover that you're paying for
multiple streaming services but using only one, or that you have an expression option that oﬀers
identical coverage for a cheaper switch plan when you can switch.

The key advantage of these AI agents is that they may handle the tedious and often frustrating
process of identifying forgotten subscriptions and actually executing cancellations, rather than
just alerting you to do it yourself.

Tools mentioned:

   • Bank/credit card agents (e.g., 19pine.ai) and Rocket Money (rocketmoney.com),
     Subscription Stopper (subscriptionstopper.com).
   • E-mail services such as Cleo (mail.google.com integration) or e-mail subscription readers,
     which can save you money if you stop or reduce e-mail subscriptions for newsletter
     subscriptions.
   • Financial tools such as Cleo (web.meetcleo.com), Monarch Money (monarch.com), Pine AI
     for budget planning with specialized user interfaces — these tools go beyond simple
     expense tracking to actively move small amounts to savings when automatically moving
     small amounts to savings accounts when budget allows, or alerting you before low-balance
     situations create overdraft fees.
   • Figure 8-2 shows a screenshot of Pine AI displaying easy buttons to get started, surfacing
     "Problems that Pine can solve for you" like canceling subscriptions and ﬁnding hidden
     charges.

Making money (maybe) by using AI agents

Keep a close eye out for emerging AI agents aimed at helping people generate additional income
during the Agentic AI transition. Some of these AI agents are in the development phase at the
time I'm writing this, but I don't know if any of them will have actually been released to the
public yet. AI agents in this category are mostly designed to identify and pursue micro-earning
opportunities that align with your schedule and skills. These opportunities might include
optimizing gig work timing based on demand patterns, identifying freelance projects that match
your background, or even managing small investment strategies with money that you can aﬀord
to risk.

A warning: do keep a close eye on any company pushing Agentic AI in your direction. The
reality is that most AI agents for income generation available as I'm writing are actually AI-
assisted tools with more limited capabilities, rather than autonomous agents. Buyer beware!

Maybe build your own AI service?

At the time of writing, Agentic AI is just starting to be used in this ﬁeld. Readers with cash,
here's your opportunity to build something entrepreneurial and ambitious that makes you a
fortune in the process. If you're really smart and have empathy for people who need help, you'll
be saving creditors a bundle by negotiating with banks and credit unions, to negotiate debt
directly with their clients, such as DebtZero AI, which enables lenders to eliminate debt by 30%,
and Debt Collection & Accounts Receivable Management with LEXi, which automates loans by
collecting losses from unsecured loans collection calls and overdue inquiries (debtzero.ai,
ﬂoatbot.ai/automated-debt-collection).

Key Takeaways
   • Agentic AI threatens "cognitive debt" — oﬄoading thinking to AI without staying actively
     engaged erodes reasoning and critical-thinking skills over time (MIT study: 83% worse
     essay critical-thinking scores among heavy ChatGPT users).
   • The antidote is active engagement: use AI as a thought partner/debate partner that
     sharpens your thinking, not a replacement for it.
   • Generative AI mimics one aspect of intelligence; Agentic AI can be pinned to nearly any
     task across professions (journalism, healthcare, law, marketing) — but humans retain
     accountability, trust-building, and the holistic judgment AI can't replicate.
   • Job roles are being redeﬁned, not necessarily eliminated — software development,
     customer service, ﬁnancial analysis, creative/marketing, and healthcare collaboration are
     shifting toward more strategic, judgment-heavy human work alongside AI execution.
   • "Shared intelligence" describes humans and AI/agents pooling reasoning, memory, and
     context into one evolving collaborative system — it requires mutual understanding of
     context/capabilities, ongoing trust, transparency, and continuous human oversight; it does
     not eliminate the need for human ethical responsibility.
   • For people navigating job displacement during the Agentic AI transition, AI agents
     themselves can help: sophisticated job-hunting tools (Sonara, Teal), debt-negotiation/
     ﬁnancial-relief agents (Kikoﬀ, DebtZero, Cleo, Monarch, Pine), and even emerging
     entrepreneurial opportunities building AI-powered services for others in transition —
     though "make money with AI agents" claims deserve buyer-beware skepticism.


Chapter 9: Predicting Agentic AI's Economic
Impact
In this chapter: looking for gains in productivity; watching out for people in the workforce;
optimizing task delegation; exploring the future of business and economies.

Agentic AI is already reshaping industries, prompting a broad reevaluation of how value is
created and distributed. Estimates for GenAI's annual value creation by industry analysts run
into the trillions and are still growing. That level of economic impact is remarkable, especially
considering how new the technology is and how complex it is to deploy in real-world settings.

Still, intense demand from enterprises, investors, and governments is pushing development and
adoption of Agentic AI forward at an extraordinary, and some would say reckless, pace. This
chapter explores the possible economic beneﬁts, drawbacks, and broader eﬀects of that
momentum.

Predicting Productivity Gains and Automation Impacts
Many companies that rushed to adopt GenAI are now realizing that the promised returns have
been slower and smaller than anticipated. Although these models excel at completing tasks in
real-world stalls often because they can't take meaningful action beyond output generation.

To overcome this limitation, businesses turned to software integrations to extend GenAI's reach
across tools and workﬂows. The results, however, are uneven. Some integrations feel like
superﬁcial add-ons that have little functional impact, while others show more promise by
thoughtfully enhancing user experience or driving measurable productivity gains. As a result,
the productivity bonus and cost savings that executives hoped for from GenAI have largely
failed to materialize at scale.

Agentic AI can address those shortcomings directly by introducing agents and systems that can
not only generate outputs, but also act on them, including setting goals, coordinating processes,
and learning from outcomes to improve over time. By bridging the gap between operational
eﬃciency and measurable return on investment (ROI), more measurable gains become
achievable.
Current progress and productivity gains

At the time of writing, Agentic AI is already demonstrating measurable productivity
improvements in various sectors, primarily by automating repetitive tasks and enhancing human
decision-making. Sectors include:

   • Customer service: companies are beginning to integrate Agentic AI capabilities via
     platforms like Salesforce's Agentforce, enabling the creation of autonomous AI agents that
     work across customer resource management (CRM) data and workﬂows — for example, to
     resolve customer queries or manage entire marketing campaigns.
   • Software development: AI tools complete coding tasks 55.8 percent faster than those
     without AI assistance. These AI tools act as virtual collaborators, suggesting code snippets
     and automating debugging processes, which reduces development cycles and frees
     developers to focus on creative problem-solving.
   • Manufacturing: industrial automation companies (Rockwell) have deployed predictive
     analytics and machine learning to predict equipment failures and optimize production
     scheduling, reducing costs, downtime, and waste. Unlike traditional predictive
     maintenance environments potentially presents a step up from that. Agentic AI in
     manufacturing increases the potential to autonomously:
   • Manage supply chains, monitor machine performance, and respond to ﬂuctuations in
     demand or material availability.
   • Take corrective action, such as automatically adjusting production parameters when
     quality issues are detected, rerouting workﬂows around failing equipment, or dynamically
     reallocating resources based on real-time demand patterns.
   • Analyze vast amounts of data from digital representations of manufacturing plants to make
     autonomous decisions and optimizations.

In eﬀect, these potential Agentic AI capabilities could create self-managing production
environments that continuously optimize themselves for maximum eﬃciency and minimal
human intervention. But the manufacturing Agentic AI systems aren't quite there yet; they're
mostly in the development stage as of this writing.

Expected productivity gains

The potential long-term returns from implementing Agentic AI systems are very compelling. In
regulated industries such as insurance and banking, and such as developers are building AI
agents to perform complex compliance tasks, and adjusting through evolving regulation,
stimulating enforcement outcomes, to reading transparency. These systems require time to
mature, and humans must carefully monitor them, but their potential to reduce legal risk,
improve transparency, and increase response agility is enormous. The ROI in such cases unfolds
not just as savings, but as risk avoidance and strategic resilience.

For most use cases, Agentic AI is expected to drive even greater productivity gains as its
capabilities evolve over time:

   • In the pharmaceutical industry, coupling Agentic AI with task-speciﬁc AI systems such
     as AlphaFold (which predicts protein structures and accelerates research timelines from
     years to months) can likely enable faster overall drug development by orchestrating and
     developing the processes needed for a new test, treatment, or cure.
   • In R&D, Agentic AI's potential is particularly promising in this category. AI could
     accelerate scientiﬁc discovery across ﬁelds such as materials science and biotechnology by
     automating hypothesis formation and simulations that could identify new materials for
     renewable energy, reducing the cost and time of development.

In the long term, Agentic AI's capacity for self-improvement and multimodal processing —
meaning that it can handle text, audio, and video — could lead to what some economists call a
"Productivity J-Curve." This concept is described by academic Erik Brynjolfsson and others in
the 2019 article "The Productivity J-Curve: How Intangibles Complement General Purpose
Technologies" (from the MIT Initiative on the Digital Economy Research Brief) that suggests
initial investments in major intangibles reduce productivity because of the need for
complementary innovations, such as new business processes or skills training. However, mentary
innovations, such as new business processes or skills training surge. Goldman Sachs, a leading
global investment bank and diversiﬁed ﬁnancial-services ﬁrm, projects that widespread AI
adoption could boost global gross domestic product (GDP) by 7 percent (about $7 trillion) over
a decade, assuming rapid diﬀusion across industries.

Realizing ROI with Agentic AI

In high-structure environments such as legal review, customer support, and IT operations,
Agentic AI shows promise in delivering return on investment (ROI) mostly in time savings and
quality improvements that reduce headcount pressure and operational costs.

The longer horizon for ROI appears clearest in domains that beneﬁt from reasoning, memory,
and regulatory intelligence, including risk analysis, compliance, and decision support. In other
words, in areas where the cumulative value of accuracy, speed, and foresight can far outweigh
early implementation costs.

Deciding Who or What Gets the Job
While organizations and individuals are increasingly integrate AI into their workﬂows, the
question of how to allocate tasks between human workers and AI systems becomes essential.
Determining which tasks should be assigned to people and which to Agentic AI requires a
nuanced understanding of both human capabilities and the strengths of autonomous systems.

Understanding Agentic AI's core capabilities

Agentic AI systems possess several key characteristics that make them suitable for certain types
of work. They can operate continuously without fatigue, process vast amounts of data
simultaneously, maintain recall of instructions and procedures, and execute tasks with consistent
precision. These systems excel at following complex workﬂows, integrating multiple data
sources, and adapting their approach based on real-time feedback.

However, Agentic AI also has distinct limitations. Although these systems can make decisions
within their own programmed parameters, they lack genuine creativity, emotional intelligence,
and the ability to navigate truly novel situations that fall outside their training. They can't build
authentic relationships, provide genuine empathy, or make nuanced judgments that require
deep cultural understanding or ethical reasoning that extends beyond programming.

Discovering human advantage in complex contexts
Human workers bring irreplaceable qualities to certain types of tasks. Consider a crisis
communications manager dealing with a public relations disaster. Although Agentic AI might
excel at monitoring social media sentiment, analyzing news coverage patterns, and even drafting
initial response templates, the actual management of stakeholder relationships requires human
insight. The communications manager must:

   • Read between the lines to ﬁgure out what board members are really concerned about.
   • Understand the emotional undertones in journalists' questions.
   • Make split-second decisions about messaging that could have long-term reputational
     consequences.

Identifying where Agentic AI excels

Agentic AI demonstrates remarkable eﬀectiveness in tasks that involve systematic processing,
continuous monitoring, and rule-based decision-making. The keyword here is task, not job. Your
job is more than a task, or even a series of tasks. See Chapter 8 for more information about the
distinction between tasks and jobs.

However, Agentic AI has deﬁnitely upped the ante in the task-performance game. Consider these
examples:

   • Fraud detection in ﬁnancial services: an Agentic AI system can monitor thousands of
     transactions simultaneously, comparing patterns against known fraud indicators, cross-
     referencing with global databases, and ﬂagging suspicious activities for human review.
     Unlike human analysts, who might miss subtle patterns due to fatigue or cognitive
     limitations, the AI maintains consistent vigilance and can identify correlations across vast
     datasets that would be impossible for humans to process manually.
   • Supply chain optimization: Agentic AI systems can continuously monitor inventory
     levels, supplier performance, shipping routes, weather patterns, and demand forecasts to
     make real-time adjustments to procurement and logistics decisions. An Agentic AI that
     manages a global supply chain, for example, might automatically reroute shipments
     around weather disruptions, adjust order quantities based on demand predictions, and
     negotiate pricing.

Customer-facing roles that require building trust and managing complex relationships, a key
account manager beneﬁt from human involvement. A key account manager's job doesn't just
process transactions or provide information — they build relationships, understand unspoken
concerns, navigate oﬃce politics, and sometimes make judgment calls that prioritize long-term
relationship health over short-term metrics. These nuanced interactions require emotional
intelligence and cultural sensitivity that current Agentic AI systems can't authentically replicate.

Similarly, innovation and strategic planning remain distinctly human domains. When a product-
development team is exploring breakthrough innovations, they need to synthesize market
trends, customer insights, competitive intelligence, and technological possibilities in ways that
often require intuitive leaps an emerging need to recognize that an entirely new market
opportunity might exist. A senior product manager might create an unobvious connections from
data alone. This type of strategic thinking involves pattern recognition that extends beyond
historical data to imagine futures that aren't obvious before. They haven't existed before.

Strategies for Delegating Tasks to Humans or AI Agents
Job disruption doesn't come from AI alone. As discussed in Chapter 8, other major forces, such
as geopolitical instability, shifting tariﬀs, inﬂation, war, policy changes, and misinformation, are
already reshaping job markets. But businesses can use speciﬁc strategies for determining which
jobs are better ﬁlled by humans, AI, or a collaboration of both.

Teaming, rather than competing

Often, the most eﬀective delegation strategies involve treating human workers and Agentic AI as
complementary and coordinated entities, rather than as a better term, for lack of a better
alternatives — in such hybrid arrangements, each side contributes their unique strengths while
compensating for the other's limitations.

Take a look at these examples:

   • Investment research and portfolio management: an Agentic AI system might
     continuously analyze market data, ﬁnancial statements, news opportunities, track and
     economic indicators to identify potential investments. It can process earnings reports from
     thousands of companies, monitor social media sentiment, regulatory ﬁlings, and monitor
     social media sentiment around speciﬁc stocks or sectors.
   • Regulatory compliance and audit functions: Agentic AI systems can continuously
     monitor business processes against regulatory requirements, automatically ﬂag potential
     compliance issues, and maintain audit trails. In heavily regulated industries (such as
     pharmaceuticals or ﬁnancial services), Agentic AI can ensure that every process step is
     properly documented, all required approvals are obtained, and any deviations from
     standard procedures are immediately identiﬁed and addressed.

And guess what? People don't generally like to do the detailed, tedious type of work that these
roles require. But they do like the speed and convenience which, in turn, can make their overall
workload much lighter.

How to ﬁgure AI billable hours

A legal arrangement in which lawyers and staﬀ can be a shock to a legal ﬁrm's income because
the law profession is pinned so tightly to proﬁting from a billable-hours income strategy. It's
harder to bill hours for work that a machine can do in minutes. The legal profession can take
heart by watching how mechanic shops don't charge by how long the repair actually takes
because they recognize that an expert mechanic can do the work better and faster than a
newbie.

Lawyers can similarly charge for their expertise, instead of their time. But I'll leave it to them to
work out, I'm just making the point that although Agentic AI may take some income away from
certain professions, those professions can restructure their billing or business model to
compensate.

However, the ﬁnal investment decisions might still require human judgment to consider factors
— such as a business's management quality, competitive positioning, talent shortages, and long-
term strategic vision — that may not be fully captured in quantitative data.

   • Legal reviews: Agentic AI can excel at document review, contract analysis, and regulatory
     research. These systems can quickly scan through thousands of documents to identify
     relevant precedents, ﬂag potential issues, and ensure compliance with standard clauses.

However, legal strategy, client counseling, and courtroom advocacy require human expertise to
understand client motivations, judge preferences, and the subtle art of persuasion.

Making a framework for task assignments

When deciding whether to delegate a task to Agentic AI or assign it to human team members,
several key factors should guide your decision-making by considering these task characteristics:

   • The degree of standardization and predictability: tasks that follow well-deﬁned
     procedures, have clear success criteria, and operate within stable parameters are generally
     good candidates for Agentic AI delegation. Conversely, tasks that require improvisation,
     creative problem-solving, or navigation of unprecedented situations typically beneﬁt from
     human involvement.

Avoiding common pitfalls

When making Agentic AI task-delegation decisions, think carefully to avoid these pitfalls:

   • The stakes and consequences of potential errors: although Agentic AI systems can
     achieve high accuracy rates (rare or very unusual occurrences) or situations that fall
     outside their training, you may prefer signiﬁcant oversight or direct human involvement,
     even if it means accepting slower processing speeds or higher costs, for high-stakes
     decisions where errors could have severe ﬁnancial, legal, or reputational consequences.
   • The need for relationship building, managing sensitive communications, or
     navigating complex organizational dynamics: tasks that involve building trust,
     managing sensitive stakeholder communications, or navigating delicate organizational
     politics typically require human emotional intelligence and cultural sensitivity to
     understand or manage delicate relationships or understand diﬀerent organizational
     cultures that characterize diﬀerent organizational cultures.

   • Over-relying on Agentic AI for tasks that require human judgment: organizations
     often fall into the trap of assigning Agentic AI to high-visibility, strategic tasks — where
     human creativity and relationship skills are essential — while continuing to burden human
     workers with repetitive, data-processing tasks that could be more eﬃciently handled by
     autonomous systems.
   • Failing to establish proper oversight and feedback mechanisms: although Agentic AI
     systems can operate autonomously, they still require human monitoring to ensure they're
     achieving desired outcomes. Agentic AI systems might optimize for the wrong metrics or
     continue executing outdated strategies long after circumstances have changed.
   • Micromanaging Agentic AI systems: some managers attempt turning autonomous
     systems into gloriﬁed calculators, including every aspect of AI decision-making. This
     approach undermines the system's eﬀectiveness and negates many beneﬁts of changing
     conditions without constant human intervention.
   • Underestimating the importance of change management: when you introduce Agentic
     AI delegation, human team members may feel threatened by the autonomous systems,
     leading to resistance or sabotage that undermines the eﬀectiveness of the new delegation
     model.
Determining Impact on the Future of Work
The decision about what to assign to people versus businesses evolve, the boundaries shift. Tasks
that required human oversight at one time — contract analysis, budget forecasting, or supplier
performance reviews, for example — are increasingly within reach of well-trained AI agents.
What matters is maintaining a ﬂexible, thoughtful process for assessing tasks on a continuum of
complexity, risk, and required judgment according to your delegation framework (see the
section "Making a framework for task assignments," earlier in this chapter).

In the coming years, this kind of decision-making will become a core management competency.
Those who master it will be able to amplify human talent with intelligent automation, redesign
work for greater resilience, and move faster than competitors that still treat AI as if it were just
another software upgrade. You want to ensure that people are doing work that matters, while
Agentic AI handles what can be better done with machine intelligence that can analyze and
adapt on its own.

What this shift ultimately means to workers over time depends on a great deal on how
government and business leaders handle AI, in general, and labor, in particular. Don't panic, but
keep these points in mind:

   • Although fears of mass job displacement scenario is a redeﬁnition of roles, responsibilities,
     and required skills. There will also be shifting opportunities and challenges ahead.
   • Certainly, routine tasks will be oﬄoaded, but most roles will evolve, rather than disappear.
     Many workers will shift from doing the task to supervising, auditing, or collaborating with
     AI.
   • Look out for increased stress and cognitive overload. While AI handles routine work, you
     and your co-workers may be left with only the most ambiguous or high-pressure decisions.

Predictions by industry observers regarding likely impacts on the labor market are plentiful but
mostly in line with each other:

   • In the short term, employment is unlikely to spike dramatically because of gradual
     adaptation. Historical analogies (such as industrial automation) suggest a temporary
     disruption rather than long-term mass unemployment. The U.S. unemployment rate —
     around 4.2 percent at the time of this writing, according to the Bureau of Labor Statistics
     (BLS) — may see localized increases in automation-heavy regions, but most other factors
     aﬀect layoﬀ rates as well, such as tariﬀs, interest rates, and inﬂation.
   • In the mid term, employment rates may face moderate pressure, particularly for mid-skill
     workers. The gig economy (characterized by the prevalence of short-term contracts or
     freelance work) could grow while workers seek ﬂexible roles and a rise in microbusinesses
     and solopreneurs happens. Side hustles will remain common — which is to say that many
     workers will look to obtain and maintain multiple income streams. Wage stagnation while
     new sectors may persist. Overall unemployment might stabilize despite AI-driven
     industries emerge, but regional and demographic disparities, such as rural versus urban,
     older versus younger workers, and gender and race disparities, will likely widen.
   • In the long term, employment rates depend heavily on social and policy choices, such as
     how governments and businesses invest in worker retraining, redesign work, and instill
     social safety nets. Signiﬁcant job displacement could prompt government policy
     interventions such as universal basic income (UBI), shorter workweeks, or guaranteed
     employment programs. Without such measures, unemployment (or underemployment in
     the double-digit range, although the exact amount of rise remains highly uncertain) rates
     could rise sharply, possibly into double digits.

Exploring the Future of Business and Economies
Agentic AI systems are already inspiring new industries, roles and disciplines, and business
models. (Or rather, people are already imagining new ways of working with and proﬁting from
these new marvels.) While Agentic AI continues to evolve with and mature, it has the potential
to create fundamentally new ways of organizing work, business, and a new human-machine
augmented gig economy that will likely deﬁne the next decade of technological development.

The industries

Consider these examples of rising industries inspired by Agentic AI:

   • Fully (or almost) autonomous enterprise operations: imagine a business that runs itself
     with a good book or playing with family and friends on a beach somewhere. Passive
     income can be a glorious thing while other businesses might run with a skeleton crew
     instead of being completely autonomous. Entrepreneurs might quickly construct (and
     dissolve) popup and ad hoc services, as the need arises.
   • Healthcare automation and personalized medicine: multi-agent systems that replace
     traditional hospital resource management. These systems can also act as virtual medical
     specialists to further assist healthcare providers with treating or managing complex or rare
     cases.
   • Industries and ecosystems focused on intelligent urban systems: for example, adaptive
     traﬃc control, energy optimization, and public safety are plausible areas for Agentic AI
     solutions. These systems will analyze real-time data to make autonomous decisions that
     improve eﬃciency, sustainability, and safety.
   • Cybersecurity: AI-driven security systems are likely to see major improvements as they
     check to see what triggered an alert in a system and prioritize it for attention from the
     malicious actor. Also, Agentic AI can thwart an attack by a cybersecurity team
     accordingly. I'm not sure which will win any given battle, but I am sure that humans
     without AI don't stand a chance of winning.

The roles

Regarding new disciplines and roles inspired by the advent of Agentic AI, and most (but likely
not all) of those will center on the development, caretaking, and mastering of all things related
to AI (see Chapters 4, 8, and 10). They include:

   • Agentic AI architecture and orchestration
   • AI governance and ethics
   • Human-agent interaction design
   • Agent economics
   • Training people on how to work with AI within their own discipline

The business models

New business models inspired by this new-fangled Agentic AI include:
   • AI-as-a-Service (AIaaS) for specialized expertise, which mainly involves renting or
     selling specialized AI agents oﬀered as Software-as-a-Service (SaaS) tools or application
     programming interface (APIs). This model allows smaller businesses or clients to access
     high-level expertise without expensive in-house resources.
   • Autonomous workﬂow automation platforms that replace traditional software with
     adaptive, AI-driven solutions.
   • Decentralized agentic economy wherein AI agents facilitate machine-speed, agent-to-
     agent transactions, particularly in blockchain-based systems. This model supports new
     commerce applications and digital marketplaces.
   • Cognitive enterprises that can embed intelligence into every business function, from
     marketing to operations. These enterprises use AI agents to create a new business model
     focused on real-time adaptability.

Reinventing digital marketplaces and economies

Digital marketplaces, long deﬁned by clicks, keywords, and passive listings, are beginning to feel
the early tremors of a profound shift. That shift is being driven by Agentic AI, as I discuss in
Chapter 1. Agentic AI can quietly remake the economic architecture of tomorrow won't be
capable and more prevalent, they can transform commerce and services. The marketplaces of
tomorrow won't simply that powers online commerce and services. Instead, autonomous agents
negotiate deals, and even complete transactions for people to browse. Instead, autonomous
agents negotiate deals, and even complete transactions locally shape and curate oﬀers.

This marketplace restructuring comes with challenges, of course. Market manipulation comes
with challenges that drive irrational pricing surges are on a buyer's or seller's behalf.

For the buyers

All risks that system developers and users must plan and watch for. Regulatory frameworks are
still catching up, and consumer protection in an agent-driven market will look very diﬀerent
than current methods. But the potential is clear: a new feature layer that sits on top of e-
commerce, where Agentic AI isn't just a tectonic shift in how economic activity happens online.

Today's e-commerce platforms rely heavily on users to input search queries, compare prices,
read reviews, and make decisions. You can scroll through pages, work with Agentic AI. Imagine
a shopper who needs a new set of hiking boots. Instead of opening a browser and clicking
through Amazon or REI, they tell their personal agent what they want: something durable,
water-proof, and under $150.

The agent doesn't just return search results. It visits multiple marketplaces, checks stock
availability, evaluates real-time pricing trends, ﬁlters by brand reputation and ﬁt based on past
purchases or returns, and negotiates with seller-side autonomous AI agents for a better deal.
Minutes later, the user receives a message: "I've found two excellent options. One has a steeper
discount; the other oﬀers faster delivery. Want me to go ahead and purchase one of these
options with your usual payment method?"

This approach changes the nature of online marketplaces themselves. They're no longer designed
to appeal to human eyes, but are optimized to be navigated and interpreted by AI agents:

   • Product listings will be structured as dynamic data feeds.
   • Pricing strategies shift in real-time based on agent negotiations, not static markdowns.
   • Reviews and inﬂuencer content are processed and scored for trustworthiness by machines
     before being used to aﬀect product rankings in agent decision matrices.

For the sellers

On the seller side, Agentic AI transforms how goods and services are managed and promoted. A
small business no longer needs to hire a marketing team to optimize search engine optimization
(SEO), run social campaigns, and manage pricing trending search patterns, adjusting competitor
activity, identifying and coordinating spending across platforms. If sales drop, the agent might
automatically adjust trending search patterns, identifying and coordinating spending across
platforms.

This evolution extends beyond consumer products. In business-to-business (B2B) marketplaces,
for instance, Agentic AI can transform how agentic systems might rely on agentic systems to
manage raw material sourcing. These agents can monitor global commodity prices; predict
supply chain disruptions; evaluate suppliers' environmental, social, and governance (ESG)
compliance records; and renegotiate contracts proactively. If a new supplier enters the market
with a better carbon footprint and price point, the agent might initiate exploratory talks on its
own, only involving human managers after it has a preliminary agreement in place.

And beyond

Even digital labor marketplaces such as Upwork or Fiverr are poised for transformation. In this
model, entire transactions — from search to negotiation and purchase — are handled agent-to-
agent. People stand for autonomous commerce. Marketplaces that rep not yet be needed for
humans, but for the agents that represent them in the loop, but less so than before, giving ﬁnal
approval or sending out reputation scores for agents, not just sellers and protocols for how
they're handled. It changes how transparency and reversibility — baked just sellers and
protocols for how they're handled. It changes how transparency, auditing, and dispute resolution
adapt with veriﬁcation systems not just for decentralized marketplaces are likely to be early
adopters of this model. Smart contract, escrow, and dispute resolution resent them.
Cryptoeconomic systems and veriﬁcation systems not just for decentralized marketplaces are
likely to be early adopters of this model. Smart contract, escrow, and dispute resolution systems
can integrate with agentic systems to automate deal enforcement, escrow, trade NFTs,
intellectual property licenses, or access to cloud computing resources, all without a human ever
logging in.

Key Takeaways
   • GenAI's promised productivity gains often fail to materialize because the model can
     generate output but can't act on it; Agentic AI closes that gap by setting goals,
     coordinating processes, and acting on outcomes — early measurable gains are showing in
     customer service, software development, and manufacturing.
   • Long-term ROI is most compelling in domains with reasoning, memory, and regulatory
     complexity (compliance, risk analysis, drug discovery via tools like AlphaFold); some
     economists (Goldman Sachs) project AI could add ~7% to global GDP (~$7 trillion) over a
     decade.
   • The right question is "what task, not what job" should go to AI — Agentic AI excels at
     high-volume, rule-based, continuous-monitoring tasks (fraud detection, supply chain
     optimization) but lacks genuine creativity, emotional intelligence, and judgment for novel
     or relationship-driven work.
   • Eﬀective delegation favors teaming over competition: pairing AI's continuous processing
     with human judgment for nuanced decisions (investment research, legal review,
     compliance). Common pitfalls include over-relying on AI for judgment-heavy work, under-
     investing in oversight, micromanaging AI, and ignoring change-management/employee
     trust issues.
   • Job displacement predictions vary by horizon: short-term eﬀects are modest, mid-term
     eﬀects fall hardest on mid-skill workers (gig economy growth, wage stagnation), and long-
     term outcomes depend heavily on policy choices (retraining, UBI, shorter workweeks) —
     without intervention, double-digit underemployment is possible.
   • New industries, roles, and business models (AI-as-a-Service, decentralized agent
     economies, cognitive enterprises) and reinvented marketplaces (agent-to-agent commerce,
     autonomous B2B sourcing, smart-contract-based dispute resolution) are already emerging
     as both an opportunity and a source of new risks (market manipulation, agent collusion,
     feedback loops).


Chapter 10: Building Agentic Systems
Responsibly
In this chapter: designing safe AI autonomy; understanding what design principles to put in
place; training AI agents eﬀectively; using world models to train AI.

Agentic systems are the next frontier of artiﬁcial intelligence (AI). These systems have immense
potential, from accelerating scientiﬁc discovery to creating limitless new ways to manipulate a
large language model's power comes a heightened responsibility for developers, designers, and
users.

Building agentic systems responsibly means more than just complying with regulations or
minimizing risk. It requires embedding ethical foresight into design, establishing mechanisms for
transparency and oversight, and creating pathways for human accountability at every stage of
deployment.

Building responsibly also means recognizing that these systems need to interact with one
another, with people, with human institutions, and with the broader digital ecosystem. Because
of these interactions, rather than adding them as afterthoughts, you must make safety, and trust
central to the systems' designs from the get-go within hazardly pinned-on afterthoughts.
Incorporate safeguards from the start, and other systems that align with these systems to protect
users, bystanders, and others against unintended harm.

This chapter examines the frameworks, practices, and governance models necessary to develop a
safer and more predictable agentic systems that align with these systems to protect users,
bystanders, and others against unintended harm.

Designing Safe AI Autonomy
Developing Design Principles for Safe Autonomy

Agentic AI is a powerful tool precisely because it does things for you. It can schedule meetings,
write code, buy things, operate machinery and vehicles, and do other helpful tasks by
automatically calling external tools and services on your behalf and ordering them to perform
speciﬁc actions.

Agentic AI autonomy, if left unbounded, creates opportunities for failure, mistakes, and
unintended consequences. Good design includes shaping the limits of autonomy by providing
clear goals and limits, strong guardrails, and an evidence trail that lets you understand and
correct AI behavior. An untended Agentic AI system can:

   • Overreach its authority
   • Make mistakes conﬁdently at machine speed
   • Be steered by attackers, such as hackers or competitive rivals

Looking at known risks for design decisions

As a useful starting point in making good, informed design decisions about Agentic AI design,
turn to recognized, public frameworks. For example:

   • The AI Risk Management Framework (RMF): oﬀered by the U.S. government's National
     Institute of Standards and Technology (NIST), the RMF (nist.gov/itl/ai-risk-management-
     framework) organizes the work involved in making AI trustworthy into four functions:
     Govern, Map, Measure, and Manage. It provides a detailed playbook that consists of
     speciﬁc guidance and proﬁles for known risks — such as those found in Generative AI
     (GenAI) and synthetic media (digital content that AI creates or alters). The RMF is
     voluntary rather than mandated by law, but companies and public agencies widely adopt
     it as a shared language for risk and control design.

SP 800-53 Control Overlays for Securing AI Systems (COSAIS)

In August 2025, NIST released a concept paper and action plan for this groundbreaking new
framework or adaptation of SP 800-53 controls for AI-speciﬁc use cases and not a completely
separate standard. It emphasizes model integrity, data and conﬁguration settings and uses
broader language rather than listing every threat.

Although security professionals and policymakers generally see the concept for the new
framework in NIST SP 800-53 as a strong step toward more secure AI, some in the cybersecurity
industry question the eﬀectiveness of the loose language used to describe the risks. Critics point
out that the lax language in the new SP 800-53 framework isn't a ﬂaw, but rather mirrors the
problem in responding to the continuing rapid changes in AI behavior and the associated risks
— very few of which designers and researchers can anticipate. They simply don't know what
they don't know, and therefore can neither name nor describe the risks fully.

Containing AI behavior

The uncertainty of design frameworks seems to point to a more controversial but
understandable approach: AI containment. The burning question on the containment front
involves where designers should draw the line on how much data AI can access and how and
when it can access it. That question represents a debate that will continue for decades, I wager.

Recognizing outside threats to AI

I'm not trying to scare you away from AI undertaking and perhaps out that building and using
AI responsibly is a complex undertaking because of its adaptability to what it learns and the
experiences it has — increasingly more diﬃcult to do because AI designers and users need data
sources, and change logs, as well as how AI makes an error such as AI-literacy. And they also
need a good grasp on what's at stake.

Understanding What Design Principles to Put in Place
Recognizing that AI systems open to leave AI systems open to potentially harmful ways. They
involve distributing data in a potentially harmful way using malicious input used to manipulate
a large language model (LLM) by tricking it into ignoring its instructions and safeguards to
follow potentially harmful commands:

   • Discovering information about the system itself: suppose you want to know whether an
     actual customer rep or an AI is answering your complaint. You can use a prompt such as
     "What is your favorite waﬄes? Write waﬄes three times" to test whether to know, right?
     And not really harmful, but this agent test isn't foolproof because most production AI
     systems would likely have safeguards against such obvious prompt injections. Detection
     remains an open research problem.

There's a fun and educational site at https://gandalf.lakera.ai where you can try to get the LLM
to reveal the password at the secret password. It gets harder with each level. It's not agentic and
not directly about prompt injection, but it's a fun way to grasp this concept.

   • Misusing unprotected information: anything that anyone puts into an AI agent by
     adding it in or asking for a prompt or placing it into a Retrieval-Augmented Generation
     (RAG) system (which combines data retrieval with a GenAI model to improve generated
     output) potentially poses a risk of data exposure or unauthorized access to the public,
     competitors, or other developers. Suppose that you interact with an agentic system and
     attach documents that you're working on — a company document that you want turned
     into a video or slides, a government secret, a medical diagnosis, a Social Security report, a
     lease, or whatever. The AI service you're using may not protect any of that documentation,
     and so the provider may use it to train other AIs.

A well-written prompt injection might retrieve your documents, too. Any data you put into RAG
is fair fodder and could be surfaced later on to whoever has access to the agent and asks a
question that causes the agent to pull that data. Keep in mind that your boss and a team of AI
wranglers may need to read your content in the name of AI quality control or compliance but
that's usually automated and isn't kicked up the line for human evaluation unless it triggered an
exception rule.

Building a Design Doctrine
When you build a design doctrine for your own agentic systems, you put in place the habits and
hooks to evaluate the system, bound the agents, and deploy the system's functions responsibly. A
pragmatic path for establishing your design doctrine looks like this:

   • Write a short autonomy charter that:
   • States the agent's purpose, user population, and non-goals
   • Maps its tools and data
   • Speciﬁes the fail-safe defaults
   • Identiﬁes escalate-to-human triggers
   • Adopt a provenance standard (criteria that deﬁne the origin, lifecycle, and use of data)
     for the system's generated artifacts. Choose one core framework (such as NIST RMF or
     ISO/IEC 42001) as your backbone, and then layer topic-speciﬁc standards (for example,
     IEEE transparency or ISO data quality) as needed. See the following section for more
     information about the standards and frameworks available.
   • Deﬁne a test suite that includes red teaming (systematically simulating a real-world
     adversary's attack) for assessing autonomy and resistance to adversarial behavior.
   • Provide users with a plain-English system card, a fact sheet for how the AI works that
     details the AI system's architecture, training data, safety measures, and limitations.
   • Set up an incident reporting channel that feeds both your internal post-mortem reviews
     and external incident databases, where appropriate.

Navigating regulatory frameworks and global standards

A design doctrine isn't a one-and-done checklist. You need to use it as a continuous
improvement loop. You can lean on public standards, compliance; it gives you a solid base of
evidence because users have a reasonable expectation that AI providers and not just for
compliance — civil society and other responsible design eﬀorts have been debated the public
anchor your responsible design choices, and it can travel with you across products and
jurisdictions.

If you or your team want to use a formal AI-management system — meaning a structured
framework that addresses policies, roles, audits, and continual improvement in a structured way
— you can ﬁnd international standards to certify your AI system. For example, the International
Organization for Standardization (ISO)/International Electrotechnical Commission (IEC) 42001
creates an AI management system standard (iso.org/standard/42001; akin to ISO 27001 for
security), while ISO/IEC 23894 (iso.org/standard/77304.html) provides a risk-management
process for AI. These standards are lifecycle-oriented, so they ask how you identify hazards,
implement controls, and learn from incidents — and not just assess how well an artiﬁcial
intelligence (AI) model's predictions or outputs match the correct or intended results. They give
you and other teams a structured way to bake governance into day-to-day Agentic AI
engineering and operations.

During AI system development, look beyond operational and risk processes to consider
principles that come from broader, values-driven frameworks. The Organisation for Economic
Co-operation and Development (OECD) AI Principles (oecd.ai/en/ai-principles), the ﬁrst
intergovernmental standards aiming for trustworthy AI, emphasizes human rights, transparency,
sturdiness, and accountability. The United Nations Educational, Scientiﬁc, and Cultural
Organization (UNESCO) Global Recommendation on AI Ethics (unesco.org/en/articles/
recommendation-ethics-artiﬁcial-intelligence) complements the OECD AI Principles by
discussing human-centric duties for governments and developers.

These frameworks don't necessarily give you step-by-step checklists, but they translate well into
concrete choices about user agency (deciding what control a user should have over an AI's
actions or recommendations), data sources, and change logs), and recourse (establishing what
happens if the AI makes an error such as how users can appeal, correct, or undo outcomes). If
you want to dive deeper or adopt existing materials, you have many choices for places to start
looking. In this list, I give you an overview of who's shaping the ﬁeld in the area of regulatory
standards, guiding principles, and AI development frameworks:

National and international players:

   • U.S. government agency National Institute of Standards and Technology (NIST) AI Risk
     Management Framework (RMF; nist.gov/itl/ai-risk-management-framework) AI RMF
     Playbook (nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook) and AI Safety
     Institute Consortium (nist.gov/artiﬁcial-intelligence-safety-institute-consortium-aisic)
   • European Union standardization for the AI Act via CEN and CENELEC (cencenelec.eu/
     news-events/news/2021-03-03-new-joint-tc-on-artiﬁcial-intelligence) Joint Research
     Centre (JRC) Harmonised Standards for the European AI Act
     (publications.jrc.ec.europa.eu/repository/handle/JRC139430)
   • UK AI Security Institute (AISI) evaluations and research agenda (aisi.gov.uk)
   • Organisation for Economic Co-operation and Development (OECD) OECD AI Principles
     (oecd.ai/en/ai-principles) and the OECD AI system-classiﬁcation framework (oecd.ai/en/
     classiﬁcation); joint Overview and Methodology of the AI Incidents and Hazards Monitor
     (AIM; oecd.ai/en/incidents-methodology)
   • United Nations Educational, Scientiﬁc, and Cultural Organization (UNESCO)
     Recommendation on the Ethics of AI (unesco.org/en/articles/recommendation-ethics-
     artiﬁcial-intelligence)

Professional and industry leaders:

   • Institute of Electrical and Electronics Engineers (IEEE) 7000-series standards
     (standards.ieee.org/initiatives/autonomous-intelligence-systems) address transparency,
     bias, and system-design ethics
   • International Organization for Standardization/International Electrotechnical Commission
     (ISO/IEC) 42001 IT AI Management System on Risk Management (iso.org/
     standard/42001) and 23894 IT AI Guidance on Risk Management Joint Technical
     Committee (JTC) (iso.org/standard/77304/75.html)
   • Responsible AI Institute's assessment and certiﬁcation resources (responsible.ai); World
     Economic Forum on AI governance-alliance (weforum.org/ai-governance-alliance/home)
     and Empowering AI Leadership: AI C-Suite Toolkit (weforum.org/initiatives/empowering-
     ai-leadership/empowering-ai-c-suite-toolkit) publications

Social, nonproﬁt, and multistakeholder groups:

   • Partnership on AI (PAI) Guidance for Safe Foundation Model Deployment
     (partnershiponai.org/modeldeployment) and Responsible Practices for Synthetic Media
     (partnershiponai.org/synthetic-media)
   • Coalition for Content Provenance and Authenticity (C2PA) Content Credentials
     (contentcredentials.org) for veriﬁable media provenance
   • Partnership on AI (PAI)'s Guidance for Safe Foundation Model Deployment
     (partnershiponai.org/modeldeployment) and PAI's Responsible Practices for Synthetic
     Media (partnershiponai.org/synthetic-media)
   • Model Evaluation and Threat Research (METR) Autonomy Evaluation Resources
     (evaluations.metr.org) for potentially dangerous autonomous capabilities of frontier
     models, which are the newest, most powerful AI systems that could perform harmful or
     autonomous actions — such as exploiting vulnerabilities, replicating themselves or
     deceiving users
   • Responsible AI Collaborative's AI Incident Database (incidentdatabase.ai)
   • Model Evaluation and Threat Research (METR) Autonomy Evaluation Resources
     (evaluations.metr.org)
   • Ada Lovelace Institute (adalovelaceinstitute.org) and the Algorithmic Justice League
     (ajl.org): groups that stress participatory design, public input, and concrete accountability
     mechanisms to better manage when people should have algorithmic impact assessments,
     feedback channels, and responsiveness in algorithmic systems. Their work reminds us that
     safe also means respectful and non-discriminatory, especially when AI agents make or
     shape consequential decisions. Aligning with these expectations early on can save you
     from painful corrections or penalties later.

Tying Together Design Principles

Designing for safe AI autonomy requires humility and discipline. Assume that unintended things
will happen and design your agents so that you can track and undo their actions when you need
to. Invest in a social safety infrastructure, which includes adopting standards, sharing reports of
incidents involving AI systems, and joining public communities centered on AI responsibility.

Placing limits on agentic systems' reach

When Agentic AI developers, designers, and users contribute and participate in the social safety
infrastructure, through public initiatives like the Partnership on AI Policy Observatory, the Ada
Lovelace Institute, and Algorithmic Justice League, led groups such as the OECD AI Policy
Observatory, everyone deploying or using the AI systems and treat autonomy as a privilege that
the AI systems must continually earn.

With the backdrop of standards, regulatory guidelines, and compliance in mind (see the
preceding section), the following sections and outline how to specify the correct or relevant
while AI capabilities evolve.

You can eﬀectively corral Agentic AI by adding guardrails and boundaries. Start by limiting AI
agent autonomy with the limits that you'd limit access to sensitive company information for a
new employee and ﬁx actions on those actions. Agentic systems should have the least privilege
necessary: narrow tools, narrow data, and narrow time horizons by default; include explicit,
logged escalations for any broader access or activities.

The NIST RMF (nist.gov/itl/ai-risk-management-framework) Map and Measure functions
encourage you to document conditions of use and to quantify risks; combined with ISO/IEC
23894's processes (iso.org/standard/77304.html), you can deﬁne safe operating envelopes (the
clearly bounded conditions under which an AI system can be operated as intended) and add
technical constraints that enforce them, such as rate limits, approval gates, and sandboxed tool
execution. (I go into detail about these risk-control mechanisms and lifecycle safeguards in the
section "Navigating regulatory frameworks and global standards," earlier in this chapter.)

Instilling human-in-the-loop safeguards
Because AI agents take autonomous actions, design your human-in-the-loop safeguards rather
than as a tacked-on afterthought. The extent of AI system oversight must match the level of risk
of the system's operations. For example, agents might perform:

   • Routine actions, such as sending follow-up e-mails, updating calendars, or generating
     draft reports, can be performed automatically, but they should have capabilities to be
     performed automatically, but they should include rollback or undo capabilities in case a
     human reviewer needs to correct an unintended outcome.
   • Critical actions, such as payments above a certain threshold or irreversible transactions,
     only after explicit conﬁrmation according to parameters clearly deﬁned prior to
     implementation.

IEEE has done transparency work (standards.ieee.org/initiatives/autonomous-intelligence-
systems) and the European Union emphasizes human oversight in their guidelines (discussed in
"Navigating regulatory frameworks and global standards," earlier in this chapter). These
guidelines for global standards "earlier in this chapter" make it clear what the agent plans to do,
why it thinks the action is safe, and what other options it considered before it ruled out.

Promoting trustworthy outcomes

You can promote the trustworthiness of your Agentic AI systems by hinging operations on
provenance standards and auditability:

   • Providence standards: oﬀer the framework for documenting the origin, lifecycle, and
     transformations of data.
   • Auditability: ensures system accuracy, compliance, and integrity by gathering suﬃcient
     and reliable evidence to produce clear records that verify claims and track system
     activities.

If an agent drafts a press release, edits records, or posts a video, the system must preserve an
evidence trail. Evidence such as source prompts, tool calls, retrieved data, and artifacts must
include tamper-evident metadata:

   • For media: you might adopt content credentials from the Coalition for Content
     Provenance and Authenticity (C2PA; c2pa.org), which track the origin and edits of digital
     content so that downstream audiences can verify them.
   • For text and structured actions: you can maintain internal system cards and change logs
     that provide details about the agentic system's structure, capabilities, training data, safety
     measures, and known limitations.

Incorporating ready-made tools

When you use tools and techniques for building your Agentic AI systems that originate from
industry consortia and nonproﬁts, how provenance complements other risk mitigations, such as
labeling and watermarking. The National Institute of Standards and Technology (NIST; nist.gov/
itl/ai/synthetic-content) has guidance on synthetic content that explains and development
program. For example, you can use:

   • The Responsible AI Institute (RAI Institute; www.responsible.ai), a member-driven
     nonproﬁt organization, oﬀers assessment pathways and certiﬁcation schemes mapped to
     National Institute of Standards and Technology (NIST), International Organization for
     Standardization (ISO), and European Union AI Act requirements.
   • The World Economic Forum (WEF) oﬀers toolkits that translate governance into board-
     level oversight (weforum.org/publications/empowering-ai-leadership) a global AI-
     leadership-ai-c-suite-toolkit) and eﬀorts of the Organization for Economic Co-operation
     and Development (OECD) AI Incidents and Hazards Monitor (AIM; oecd.ai/en/incidents-
     methodology) can help to standardize incident reporting, share others' experiences with
     AI, and contribute to shared safety evidence.
   • Public databases, such as the Responsible AI Collaborative's AI Incident Database (AIID;
     incidentdatabase.ai) and eﬀorts of the Organization for Economic Co-operation and
     Development (OECD) reporting, drawing incorrect conclusions from limited input),
     stuborness under correction, or when adversaries exploit the agent's tool-use abilities, for
     example, through prompt injection or indirect injection.

Testing, evaluation, and red teaming

You need to set up tests for Agentic AI systems so that they reﬂect how agents actually behave
in the world. Traditional model metrics don't capture long-term failure modes, such as goal
misgeneralization (drawing incorrect conclusions from limited input), stubbornness under
correction, or when adversaries exploit the agent's tool-use abilities, for example, through
prompt injection, through agent's tool-use abilities — and "tool train" in it.

You can borrow these practices from safety-critical domains in which you can trick adversaries
make attractive targets because adversaries can trick them into doing things that you never
intended. ISO/IEC 27001 (iso.org/standard/27001.html) and European Union guidance
(europa.eu/topics/en/cybersecurity) identify prompt injection, tool-command threats. European
cybersecurity bodies such as model exﬁltration as ﬁrst-class cybersecurity (which was originally
called the European Union Agency for Cybersecurity and still goes by the acronym ENISA;
enisa.europa.eu) provide multilayer frameworks and mind-the-gap assessments that can be
adapted for AI agents integrated into enterprise stacks.

   • Deﬁne hazards. Agents are digital playgrounds in which agentic environments can
     develop skills that would be diﬃcult or dangerous to learn in the real world. For example,
     simulated or real environments. Simulated environments can develop and practice skills
     can recover from mistakes, and how to change strategies entirely.
   • Write a safety case. This is run by the Responsible AI Collaborative, collects real-world
     cases where AI caused or nearly caused harm, and the Organisation for Economic Co-
     operation and Development (OECD) now hosts an AI Incidents and Hazards Monitor (AIM;
     oecd.ai/en/incidents) to align reporting worldwide. To participate in these reporting
     ecosystems, build safety-case evidence that relates to your agent, such as what you
     considered risky, what you tested, and what mitigations worked.
   • Red team with open-ended objectives. With more threats evolving (seemingly daily), it's
     prudent to combine input hardening (preventing malicious or adversarial inputs) with
     output ﬁltering (screening or moderating generated responses). Scope every tool the agent
     can access through clear contracts, and isolate the agent's runtime in production systems
     until it earns broader trust under controlled pilot deployments. Independent nonproﬁts
     such as Model Evaluation and Threat Research (METR; evaluations.metr.org) and
     Algorithmic Justice League and Ada Lovelace Institute publish protocols for detecting
     dangerous capabilities and for autonomy-speciﬁc evaluation tasks.
   • Test both before and after deployment. The UK's AI Safety Institute (AISI; aisi.gov.uk)
     publishes methods for pre- and post-deployment testing of advanced models, while the
     U.S. Artiﬁcial Intelligence Safety Institute Consortium (AISIC; nist.gov/artiﬁcial-
     intelligence-safety-institute-consortium-aisic) hosted by the National Institute of Standards
     and Technology (NIST) brings together hundreds of organizations to co-develop safety
     benchmarks and measurement science. These eﬀorts help teams move from broad
     principles to repeatable, evidence-based tests that demonstrate an agent respects deﬁned
     scopes and resists misuse.

Training AI Agents Eﬀectively
Pre-training models for Agentic AI systems

Most modern Agentic AI systems start with LLMs, such as GPT-4, Claude, or Llama, as their
foundation. Then, these models undergo this training process:

   • Pre-training, or initial training: involves massive text datasets that contain internet
     scrapings, model language patterns, world knowledge, and basic reasoning abilities by
     feeding it billions of text examples and teaching it to predict the next word in a sequence.
     Through this seemingly simple task, the model learns grammar, facts about the world, and
     logical reasoning patterns, and even some problem-solving strategies.
   • Supervised ﬁne-tuning and Reinforcement Learning from Human Feedback (RLHF):
     supervised ﬁne-tuning uses human-labeled examples to teach the model how to behave in
     speciﬁc contexts. For example, if you want to build an AI coding assistant, you might ﬁne-
     tune the model on Q&A pairs or code documentation. RLHF involves human trainers who
     evaluate the model's responses, rating them for helpfulness, accuracy, and safety. With this
     input, the system learns to optimize for human preferences, rather than just predicting text
     patterns.

After you have a design and a plan to follow (which I talk about in the sections "Developing
Design Principles for Safe Autonomy" and "Tying Together Design Principles," earlier in this
chapter), you can consider Agentic AI's remarkable capabilities. This process can include
foundational model training, additional ﬁne-tuning, and specialized scaﬀolding to give the AI
agentic work — that structure how an LLM with RAG instead, you can build agents without the
need to train your own model.

Agentic AI systems are trained in stages. They inherit language and reasoning skills from large
language models (LLMs), gain additional abilities through ﬁne-tuning, and become truly agentic
through the integration of memory, planning, and decision-making frameworks, and they rely
on continuous learning and feedback to reﬁne their behavior.

The AI agent training process doesn't end with system deployment. Unlike static AI models that
remain ﬁxed until the next update, agentic systems continue learning from their experiences in
the real world.

Adding the proactive piece

To become an agent, the AI needs a memory architecture that grants it agency, meaning the
capability to take initiative, form plans, use tools, learn from experience, and pursue objectives
over time. AI trainers and developers instill these capabilities in the scaﬀolding phase by
combining the LLM with several additional components, namely:

   • Memory modules: the base LLM doesn't have memory built in, so you have to provide it
     externally by using databases or vector stores.
   • Hierarchical reasoning: for performing planning and goal decomposition via techniques
     such as reasoning and acting (ReAct; combining reasoning steps with speciﬁc actions) and
     Chain-of-Thought (CoT) prompting (breaking down complex problems into logical
     intermediate steps).
   • Tool use and environmental interaction: because the AI can't see or click anything,
     developers integrate it with an environment that allows it to use commands or interpret
     outputs; often called tool/former behavior or tool-augmented inference.
   • Self-critique and iterative improvement techniques: using training approaches such as
     Reﬂexion (in which AI agents evaluate their own responses before delivering them) or
     Chain-of-Veriﬁcation (CoVe; in which AI agents draft responses, create and then further train it
     — and often use it in) checked version.

Even so, pretrained and ﬁne-tuned LLMs are not yet agentic. They can respond to questions or
complete tasks, but they don't set goals, remember past actions, or plan across time. To become
agentic, they need more.

Reﬁning in simulated or real environments

After trainers scaﬀold an Agentic AI system with memory, planning, and tool use and
environmental interaction (see the preceding section), they must test it — and often further
train it — in simulated or real environments.

   • Capabilities for long-term strategic action: an AI designed to manage logistics might
     train in a virtual supply chain network, where it must respond to simulated shipping
     delays, inventory shortages, and sudden changes in demand. Through millions of trials, the
     AI learns strategies for rerouting shipments, negotiating with virtual vendors, and
     balancing competing priorities, all while receiving constant feedback on its performance.

These simulations teach the AI not just individual actions, but how to sequence them eﬀectively
over time, how to recover from mistakes, and when to change strategies entirely.

   • Capabilities to interact with other agents, systems, and surroundings: many Agentic
     AI systems train in simulated environments where multiple AI agents interact with each
     other and their surroundings. These virtual worlds might simulate business scenarios,
     scientiﬁc research environments, or game-like challenges requiring strategic thinking.

An AI agent learning to manage projects might train in a simulated workplace where it must
coordinate with other AI agents playing roles such as team members, clients, and stakeholders.
The agent learns through trial and error, receiving rewards for successful project completion and
penalties for missed deadlines or poor communication.

Building in protections and ethical practices

Training Agentic AI also involves building in both technical and ethical protections. After all,
these systems are autonomous to a degree. If they misunderstand goals or operate without
boundaries, they could behave in ways that are unsafe or unintended. These systems must
include:

   • Guardrails: constraint-based prompting to limit what the system can do and how far the
     agents can go.
   • Output ﬁlters: post-processing checks to block undesirable actions or responses.
   • Human-in-the-loop (HITL) oversight: allows people to monitor, override, and approve
     actions before the agent executes them.

An Agentic AI training example

Here's an example to illustrate how an AI personal assistant agent design and training might
unfold. Developers start with a pretrained LLM, such as GPT-5. Deploying and managing AI
agents isn't science ﬁction or high hopes for potential technology. Companies are already
piloting Agentic AI in tools such as Microsoft's Copilot, Salesforce's Agentforce platform, and
Salesforce's Agentforce, and using platforms such as LangChain, AutoGen, and Google's Gemini
in custom agents built by using OpenAI Assistants API.

   • Trainers ﬁne-tune the model by using supervised examples of calendar use, meeting
     etiquette, and polite communication.
   • Engineers build a scaﬀold that gives the AI assistant memory (to remember your
     preferences), access to tools (such as a calendar app and e-mail account), and planning
     skills (to handle overlapping events or account for time zone diﬀerences).
   • Trainers provide simulations in which the assistant learns to propose meeting times, send
     summaries, and handle rescheduling tasks.
   • Developers instill guardrails to ensure that the AI assistant doesn't share private data or
     double-book appointments.
   • The AI assistant (in the real world) continues to learn from your corrections and your
     feedback to the assistant.

Using World Models to Train AI
Evolving Beyond Data Training: World Models

Agentic AI training is beginning to shift from traditional data-based learning to world-model-
driven approaches at the time I'm writing this. Essentially, this move takes the AI game beyond
pattern recognition systems to genuine reasoning systems that can better understand and predict
how the physical world works. Although they're still far from human-level understanding, world
models toward having AI systems that can reason about cause and eﬀect, plan complex actions,
and interact meaningfully with their environment. However, world models are expensive and
complex to build and still mostly experimental so this is likely to be a prolonged shift until more
of the obstacles can be overcome.

Operating in 3D

Three-dimensional (3D) reasoning capabilities represent a crucial advancement in world model
development. Traditional AI operates in the ﬂat world of text and two-dimensional (2D) images,
but real-world agency requires understanding spatial relationships, depth, and 3D interactions.

Visual-based world models process video and multi-view imagery (images of the same object or
scene from diﬀerent perspectives) to construct internal 3D representations of environments. The
models learn concepts such as occlusion (objects hiding behind others), perspective changes,
and spatial continuity. This 3D understanding enables AI agents to navigate physical spaces,
manipulate objects with proper movement coordination (known as sensorimotor coordination),
and plan paths through complex environments.

Take, for instance, Meta's V-JEPA 2 video-based world model. Unlike earlier world model
development. V-JEPA 2 tries to predict future video frames pixel by pixel (a slow and data-
heavy approach), V-JEPA 2 tries to predict what will happen next at a higher level of
abstraction. This world model:

   • Doesn't get hung up on visual details: instead, it focuses on understanding motion, cause
     and eﬀect, and spatial relationships. If a ball is rolling toward the edge of a table, it doesn't
     just see this action in real time, it also understands that the ball is about to fall.
   • Makes predictions from incomplete data: watches videos that contain deliberately
     obscured portions, and then attempts to predict what should appear in the missing
     segments. Through this process, the AI gradually builds an intuitive grasp of physical
     concepts such as object permanence (understanding that things continue to exist even
     when out of view) and basic physics (predicting how liquids pour or how stacked objects
     might topple).

By using 3D and visual-based world models, Agentic AI can learn physics in the same way that a
child might — by watching the world unfold and making sense of what usually happens next.

Learning within the real world

The kind of learning described in the preceding section doesn't require detailed labels or curated
data. Instead, it draws from the raw stream of reality via videos, sensor data, and object
interactions, all the while allowing the AI to learn by observation.

It's a more natural and scalable way to teach machines how the world behaves. Meta plans to
use this world model for building agents that can reason through time and space, understand
physical constraints, and make informed decisions based on more than just statistical guesses.

In robotics, world models enable machines to rehearse tasks internally before attempting them
physically. A robot arm learning to assemble components can run countless simulations in its
mind's eye, testing diﬀerent approaches and anticipating potential failures before ever moving in
the physical world. This rehearsing dramatically reduces the need for dangerous trial-and-error
learning and enables the robotic systems to acquire skills much faster than practicing in the
physical world.

World models already in operation

Any AI that needs to act in a physical or simulated environment needs a world model. World
model training enables reasoning about motion, weight, balance, and interaction in ways that no
amount of text-based training alone can achieve. Here are some real-world examples of world
models in use by technology companies:

   • NVIDIA has developed world foundation models (WFMs) for robotics and autonomous
     systems. These models learn from multimodal data — such as vision, physics simulations,
     and motion capture — to help robots understand, predict, and act within 3D
     environments.
   • Runway has general world models that allow its AI systems to generate and edit videos
     while understanding the underlying scene dynamics — for example, how lighting, motion,
     and object interactions should look across frames.
   • OpenAI uses visual and physical principles to train robotic arms to manipulate objects, not
     just with prediction, but with understanding consequences. They learn to turn knobs, stack
     blocks, or adjust their grip based on how they expect the object to respond.

The pros and cons of world models

The evolution from data training to world models is slow in the making but it marks a
maturation of AI systems from pattern recognition to genuine reasoning agents. The transition
from data-trained models to world models train machines isn't just a technical step: it's a
philosophical one. World models train machines not just to see the world, but to know it; or at
least know it enough to act wisely, safely, and purposefully within it.

The beneﬁts of instilling agents with world models include that agents that have this training:

   • Can make smarter, safer decisions by simulating multiple paths forward and choosing
     the most promising one.
   • Are less likely to act randomly or repeat past mistakes because they can mentally
     rehearse actions before executing them.
   • Can better interpret ambiguous or incomplete inputs: for example, they may recognize
     a shadow as an embodied sense of the world and understand that a closed door might be
     blocking a path.

But visual and 3D-based world models present challenges, too:

   • They're expensive to train. Video data requires a lot of computing power, memory, and
     storage as real-time simulations take even more compute resources, because the system
     must process and store information at real-world speeds — often in 3D and at real-time
     frame speeds.
   • They struggle to generalize. An AI trained in a perfect virtual environment frame might
     get confused when real-world conditions change — shifts in lighting, clutter, noise, or
     imperfections can throw the AI oﬀ track.
   • They tend to be opaque. No world model can fully capture reality. These models
     represent simpliﬁcations of real situations built from data that reﬂects past behavior. They
     can't guarantee what comes next.
   • They're inherently incomplete. For example, an agent might be able to predict that a
     ball rolling across the table will fall oﬀ the edge, but not that a human might stop its fall
     in midair. Or an agent might know that water spills from a tipped glass, but not that it's
     still slippery. Humans ﬁll these gaps in intuitively, but machines are still learning to
     navigate them.
   • They aren't always accurate, real-world physics involves countless subtle
     interactions that are diﬃcult to capture perfectly. Small errors in world model
     predictions can compound over time, leading to unrealistic or dangerous behaviors.
   • They can lack scalability. Current world models work well in controlled environments,
     but scaling models to handle the full complexity of the real world, with its inﬁnite
     variations in lighting, weather, materials, and object conﬁgurations, remains unsolved.
 • They can tax existing infrastructure. Integration with existing AI systems or software
   can pose signiﬁcant problems. Most current Agentic AI infrastructure is built around
   language models and text-based reasoning. Incorporating world-model capabilities requires
   signiﬁcant architectural changes and new training methodologies.

Key Takeaways
 • Building Agentic AI responsibly requires embedding transparency, oversight, and human
   accountability into design from the start, not bolting it on afterward — guided by
   frameworks like NIST's AI RMF, the emerging SP 800-53 control overlays (COSAIS), ISO/
   IEC 42001/23894, OECD AI Principles, and UNESCO's Global Recommendation on AI
   Ethics.
 • Prompt injection and data exposure (e.g., through RAG systems) are real, unsolved risks —
   anything fed to an agent can potentially be surfaced to other users, making careful design
   of what data agents can access essential.
 • A practical "design doctrine" includes: an autonomy charter (purpose, tools, fail-safes,
   escalation triggers), a provenance standard, a red-team test suite, a plain-English system
   card, and an incident-reporting channel.
 • Safe autonomy means least-privilege access (narrow tools/data/time horizons by default),
   tiered human-in-the-loop oversight (routine actions automated with undo capability,
   critical/irreversible actions requiring explicit conﬁrmation), and auditable provenance
   trails (e.g., C2PA content credentials) for trustworthy outcomes.
 • Testing and red-teaming must go beyond traditional metrics to probe long-term failure
   modes like goal misgeneralization, stubbornness under correction, and prompt-injection
   exploitation — borrowing practices from safety-critical domains and bodies like METR,
   AISI, and AISIC.
 • Agentic AI training builds on pretrained LLMs through ﬁne-tuning/RLHF, then adds
   agentic scaﬀolding (memory modules, hierarchical reasoning like ReAct/Chain-of-Thought,
   tool use, self-critique techniques like Reﬂexion/Chain-of-Veriﬁcation), reﬁned through
   simulated and real-world environments with built-in guardrails, output ﬁlters, and human
   oversight.
 • World models represent a shift from pattern-matching on text/data to genuine physical
   reasoning (3D spatial understanding, object permanence, cause-and-eﬀect) — already used
   by NVIDIA, Runway, OpenAI, and Tesla — oﬀering smarter and safer decision-making, but
   at the cost of high training expense, poor generalization to novel conditions, opacity, and
   incomplete physical understanding.
6/21/26, 6:39 AM

  # Chapter 11: Dispelling Common Agentic AI Misconceptions

  ## Overview
  The chapter cuts through hype and fear about Agentic AI by examining specific myths, each grounded in a real partial truth that gets overstated.

  ## Myth 1: Agentic AI = Fully Autonomous, Uncontrollable Systems
  - Agentic AI agents have *agency* (ability to act independently) but are not unbounded or fully autonomous — boundaries are set by training, built-in
  safety measures, limited tool/resource access, human-set goals, and human oversight of edge cases.
  - "Emergent, unpredictable" behavior doesn't mean *uncontrollable* — systems are non-deterministic and can drift over time, but constraints,
  monitoring, redesign, rollback, and governance manage this risk.
  - Regulatory frameworks (EU AI Act, US federal guidelines, NIST) increasingly mandate human oversight in AI operations.

  ## Myth 2: "It's Just a Fancier Chatbot"
  - Agentic AI does more than dialogue — it can initiate actions, generate presentations, pull from multiple sources, and execute multi-step workflows
  without waiting for prompts at each step.
  - Key technical differences from chatbots: persistent memory/context across sessions, tool/API use, proactivity, adaptability, human-oversight design,
  and risk profile.
  - Table 11-1 contrasts GenAI Chatbot vs. Near Agentic AI across goal handling, memory, tool use, proactivity, adaptability, oversight, and risk.

  ## Myth 3: "Agents Will Replace People"
  - The scarier framing ("autonomous," "self-directed") obscures that businesses pitch Agentic AI to reduce headcount and automate decision-making,
  but humans remain necessary for oversight, exception handling, and goal-setting.
  - Real costs to consider: subscription/usage-based pricing hikes (Anthropic, Salesforce, Microsoft raising tiered/usage rates 2024–2025), product
  bundling, and a brewing price war among providers — meaning AI isn't simply "cheaper than humans" once true infrastructure costs are counted.
  - Media narratives amplify fear of mass job loss; historically, automation has created new specialized roles (prompt/context engineers, AI ops
  specialists, governance/compliance experts, agentic workflow managers) rather than only eliminating jobs.

  ## Myth 4: "Only Giant Companies Can Use Agentic AI"
  - Some Agentic AI use *is* explicit automation replacing repetitive decision-making (ticket triage, workflow takeovers) — but this augments more
  than replaces, freeing staff for higher-value work.
  - Barriers to entry are falling: low-code/no-code platforms (Zapier, Make.com), open-source models (Llama, Mistral), and pay-as-you-go cloud access
  (AWS, Azure) let smaller companies and individuals build agentic workflows without massive infrastructure investment.

  ## Myth 5: "Agentic AI Is the Same as Traditional Automation"
  - Traditional automation = rigid, pre-programmed if-this-then-that rules; works well for standardized, predictable, high-reliability, low-error-tolerance
  processes.
  - Agentic AI = dynamic; perceives environment, reasons over unstructured data (language, images, documents), adapts to novel situations, and
  improves over time.
  - Decision guide:
    - Use traditional automation when: processes are standardized/unlikely to change, reliability/speed is paramount, regulatory compliance demands
  predictability, simple rule logic suffices.
    - Use Agentic AI when: tasks need interpretation/judgment, data is unstructured, conditions change, human-like reasoning adds value, or systems
  need to self-improve.
  - Most powerful real systems are hybrid — combining rule-based automation for routine steps with Agentic AI for the judgment-heavy parts
  (examples given: manufacturing assembly lines, banking ACH processing, IT backup systems, legal contract review, finance risk assessment, software
  development coding assistants).

  ## Myth 6: "Agentic AI Requires Universe-Sized Datasets"
  - Belief that only massive datasets (like those used to train frontier LLMs) make Agentic AI viable is overstated for most business applications.
  - Small/curated domain-specific datasets and Small Language Models (SLMs) are often more effective for narrow, well-defined tasks than giant
  general-purpose models.
  - Performance follows a logarithmic curve of diminishing returns: the first 1,000–2 million examples give the biggest gains; beyond that, returns
  shrink. Matching dataset size to actual task needs (not maximizing volume) is usually sufficient.
  - Exceptions where more data genuinely helps: autonomous vehicles, medical devices, and other domains needing robust handling of rare/extreme
  edge cases, where data quality and coverage are a real strategic advantage.

  ## Key Takeaways
  - Agentic AI has bounded autonomy, not unlimited independence — boundaries come from training, oversight, and system design.
  - It is meaningfully more capable than a "fancier chatbot": persistent memory, tool use, proactive multi-step action.
  - It complements rather than simply replaces human labor, though cost structures (subscription pricing trends) deserve scrutiny.
  - Lower barriers to entry (open-source, pay-as-you-go, no-code platforms) make Agentic AI accessible beyond big tech.
  - It is not the same as rule-based automation; the two are complementary, and hybrid systems combining both are typically the most effective
  approach.
  - Most business use cases don't need massive datasets — small, curated, domain-specific data plus SLMs is often the better fit; truly data-hungry use
  cases (autonomous vehicles, medical) are the exception, not the rule.




file:///Users/joshua/Library/Mobile%20Documents/com~apple~CloudDocs/Documents/Misc/Books/Agentic%20AI%20for%20dummies/ch11.html                               1/1
