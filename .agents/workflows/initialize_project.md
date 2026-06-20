---
description: Perform security scan and check Repos Dashboard for relevant tools/skills before starting any task.
---

1. **Security Scan**: Execute `skillspector scan .` to check the current directory for vulnerabilities, malware, or insecure dependencies.
   - If SkillSpector returns any 'CRITICAL' or 'HIGH' findings, stop immediately and report the specific threats to the user. Do not proceed.
   - If findings are 'LOW' or 'NONE', proceed.

2. **Resource Discovery**: Use the `teable-bridge` MCP tool to query the 'Repos Dashboard' table in Teable.
   - Retrieve all links, tools, and skills marked as relevant to the current project's scope.
   - Summarize these findings for the user.

3. **Context Injection**: Present the summary to the user and ask: "I have identified the following resources in the Repos Dashboard: [List]. Should I integrate these into the current build plan?"

4. **Approval**: Wait for user confirmation before executing any further coding tasks.
