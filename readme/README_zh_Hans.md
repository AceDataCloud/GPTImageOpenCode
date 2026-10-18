# GPT Image by Ace Data Cloud：OpenCode 原生插件

适用于 **OpenCode 2.0.26+**：原生 `/connect` 凭据、托管 MCP、同任务查询 Skill。
复用 [OpenAIMCP](https://github.com/AceDataCloud/OpenAIMCP)，不复制 API、Schema 或计费实现。
这是 Ace 提供的独立集成，不是 GPT Image / OpenCode 官方产品。[English](../README.md)。

## 1. 安装

先 `opencode --version` 核对为2，1的插件API不同。[官方安装说明](https://opencode.ai/v2/docs/plugins/)。
源码PR为候选，main尚无实现，npm未发布、官方目录未收录。审查代码后：

```bash
opencode plugin add 'git+ssh://git@github.com/AceDataCloud/GPTImageOpenCode.git#codex/native-service-plugin'
```

也可使用 `github:AceDataCloud/GPTImageOpenCode#codex/native-service-plugin`。main经审查发布后先移除同候选目标，再装主线，不重复安装。

## 2. 注册登录与API Token

打开 [Ace Applications](https://platform.acedata.cloud/console/applications?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=opencode_gptimage_zh_key)，
找到 **General application（通用应用）**，没有则先 **Initialize General Application**。
检查 GPT Image 权限、余额与 [当前价](https://platform.acedata.cloud/models?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=opencode_gptimage_zh_pricing)。
复制 API Key，或 **Manage Keys → Create** 单独创建 `OpenCode GPT Image`。

![复制Key或进入管理，Ace账号真实截图](../assets/get-api-key-en.png)

核对过期时间和用量限制。若启用 Allowed APIs，基本流程需 `/openai/images/generations`、`/openai/tasks`，进阶工具可能需其他API。

![创建独立Key，真实凭据已遮挡](../assets/create-api-key-en.png)

图片来自作者自有 SunoDify 固定commit `8d3d03570e73324220f111f7fe343da0792a8071`，2026-10-18复用；这是Ace账号图，不是OpenCode。
图中名称Dify tutorial仅为原示例，这里填OpenCode GPT Image。复制纯Token，不加Bearer、空格、引号；platform-管理Token不能替代应用Key。不保证赠送额度。

## 3. OpenCode里粘贴

reload后 `/connect` → **GPT Image by Ace Data Cloud → Ace Data Cloud API Token — GPT Image**，粘贴原始Token。
由OpenCode保存，插件只在内存中向固定服务地址使用；不写项目或提示词。未连Key时MCP关闭，`/mcp`检查状态。
环境变量为 `ACEDATACLOUD_GPTIMAGE_API_TOKEN`，必须传给服务进程。旧后台不会继承另一个shell变量，首次可 `opencode --standalone`。

![OpenCode官方终端原图参考，非本插件或Ace调用](../assets/opencode-original-1.png)

2026-10-17收集，拍摄日期/版本未知；仅真实宿主参考。原生弹窗截图待协调串行拍摄，不制作假图。详见[SOURCES](../docs/SOURCES.md)。

## 4. 首用与同任务终态

先只看工具Schema或模型信息，**不生成媒体**。聊天模型对话本身仍可能收费。
明确批准当前价格/预算后，`openai_generate_image`只提交一次并保留task_id；后续 `openai_get_task` 的 `id` 参数用同一任务ID 查询，直到确认成功及最终媒体链接。
pending/processing不代表失败，预览URL不算完成；不要再生成来轮询，不自动收费重试，不加fallback。
归一状态由现有MCP处理，以当前返回为准。

401/403查Token/权限/有效期/限制/余额；429/5xx/超时先查原task，不向支持人员发Key。用户已有同名MCP优先，插件不覆盖。
聊天费与服务费分开；安装/连接不证明最终结果、唯一账单或营收。[反馈](https://github.com/AceDataCloud/GPTImageOpenCode/issues)。


### GPT Image 独立范围

只在本插件命名空间保留 `openai_generate_image`、`openai_edit_image`、`openai_get_task`；模型枚举只含当前Schema的 `gpt-image-*`。不暴露聊天/音频/embedding、DALL-E或Nano Banana，且不修改共享MCP。若上游Schema无法安全缩窄则隐藏提交工具。查询参数为 `openai_get_task(id=...)`，不是task_id；图片编辑权限还需 `/openai/images/edits`。

生成和编辑均必须显式选择 `gpt-image-*`。共享编辑工具默认可能为DALL-E，本插件移除该默认值，不能漏传模型后误发其他服务。
