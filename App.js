
// ============================================================
//                 HELPER LOCALSTORAGE 

const { useState, useEffect } = React;

const ls = {
    get: (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
};

// ============================================================
//                  UTILITÁRIO — Histórico

const agora = () => {
    const d = new Date();
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
};

const dataHoje = () => new Date().toISOString().slice(0, 10);

const formatarData = (iso) => {
    if (!iso) return "—";
    const [ano, mes, dia] = iso.split("-");
    return dia + "/" + mes + "/" + ano;
};

const registrar = (historico, setHistorico, acao, descricao, usuario) => {
    setHistorico([{ acao, descricao, usuario, dataHora: agora() }, ...historico]);
};

const PaginaHistorico = ({ historico, onVoltar }) =>
    React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "Histórico"),

        historico.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma ação registrada.")
            : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0" } },
                historico.map((entry, i) =>
                    React.createElement("li", {
                        key: i,
                        style: { borderBottom: "1px solid #eee", padding: "8px 0", textAlign: "left", lineHeight: "1.7", fontSize: "14px" }
                    },
                        React.createElement("strong", null, entry.acao), " — ", entry.descricao,
                        React.createElement("br", null),
                        React.createElement("span", { style: { color: "#777" } }, "👤 " + entry.usuario + "  •  🕐 " + entry.dataHora)
                    )
                )
              ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );

// ============================================================
//                          RAÇÃO


const camposVaziosRacao = () => ({
    tipo: "",
    valor: "",
    peso: "",
    dataCompra: dataHoje(),
    duracao: ""
});

// Subtópico: cadastrar, editar e excluir rações
// Subtópico: apenas o formulário de cadastro
const NovaRacao = ({ itens, setItens, historico, setHistorico, usuario, onVoltar }) => {
    const [form, setForm] = useState(camposVaziosRacao());
    const setField = (field, value) => setForm({ ...form, [field]: value });

    const adicionar = () => {
        if (!form.tipo.trim()) return;
        setItens([...itens, { id: Date.now(), ...form }]);
        registrar(historico, setHistorico, "Cadastro", form.tipo, usuario);
        setForm(camposVaziosRacao());
    };

    const inputStyle = { margin: "4px 0" };
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "🥕 Nova Ração 🥕"),
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "16px" } },
            React.createElement("input", { type: "text", placeholder: "Nome da Ração", value: form.tipo, onChange: (e) => setField("tipo", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "number", placeholder: "Valor (R$)", value: form.valor, onChange: (e) => setField("valor", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "text", placeholder: "Peso (ex: 25kg)", value: form.peso, onChange: (e) => setField("peso", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "text", placeholder: "Duração (ex: 30 dias)", value: form.duracao, onChange: (e) => setField("duracao", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da compra"),
            React.createElement("input", { type: "date", value: form.dataCompra, onChange: (e) => setField("dataCompra", e.target.value), className: "input", style: inputStyle }),
            React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a", marginTop: "8px" }, onClick: adicionar }, "Cadastrar")
        ),
        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// Subtópico: listar, editar e excluir rações cadastradas
const TodasRacoes = ({ itens, setItens, historico, setHistorico, usuario, onVoltar }) => {
    const [editandoId, setEditandoId] = useState(null);
    const [editandoForm, setEditandoForm] = useState(camposVaziosRacao());
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };
    const inputStyle = { margin: "4px 0" };

    const excluir = (id) => {
        const item = itens.find((i) => i.id === id);
        registrar(historico, setHistorico, "Exclusão", item.tipo, usuario);
        setItens(itens.filter((i) => i.id !== id));
    };

    const iniciarEdicao = (item) => {
        setEditandoId(item.id);
        setEditandoForm({ tipo: item.tipo, valor: item.valor, peso: item.peso, dataCompra: item.dataCompra, duracao: item.duracao, emUso: item.emUso || false });
    };

    const salvarEdicao = () => {
        if (!editandoForm.tipo.trim()) return;
        setItens(itens.map((item) => item.id === editandoId ? { ...item, ...editandoForm } : item));
        registrar(historico, setHistorico, "Alteração", editandoForm.tipo, usuario);
        setEditandoId(null);
        setEditandoForm(camposVaziosRacao());
    };

    const toggleEmUso = (id) => {
        const item = itens.find((i) => i.id === id);
        const novoValor = !item.emUso;
        // Desmarca todas e marca só a selecionada (ou desmarca se já estava em uso)
        setItens(itens.map((i) => ({ ...i, emUso: i.id === id ? novoValor : false })));
        registrar(historico, setHistorico, novoValor ? "Marcada em uso" : "Desmarcada em uso", item.tipo, usuario);
    };

    const setEditField = (field, value) => setEditandoForm({ ...editandoForm, [field]: value });

    const renderFormEdicao = () =>
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "8px" } },
            React.createElement("input", { type: "text", placeholder: "Tipo da ração", value: editandoForm.tipo, onChange: (e) => setEditField("tipo", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "number", placeholder: "Valor (R$)", value: editandoForm.valor, onChange: (e) => setEditField("valor", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "text", placeholder: "Peso", value: editandoForm.peso, onChange: (e) => setEditField("peso", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da compra"),
            React.createElement("input", { type: "date", value: editandoForm.dataCompra, onChange: (e) => setEditField("dataCompra", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "text", placeholder: "Duração", value: editandoForm.duracao, onChange: (e) => setEditField("duracao", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", fontSize: "14px", cursor: "pointer" } },
                React.createElement("input", { type: "checkbox", checked: editandoForm.emUso || false, onChange: (e) => setEditField("emUso", e.target.checked) }),
                "Ração em uso"
            ),
            React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "8px" } },
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a" }, onClick: salvarEdicao }, "Salvar"),
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => setEditandoId(null) }, "Cancelar")
            )
        );

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "🥕 Todas Rações 🥕"),

        itens.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma ração cadastrada.")
            : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0" } },
                itens.map((item) =>
                    React.createElement("li", {
                        key: item.id,
                        style: {
                            border: item.emUso ? "2px solid #2a7a2a" : "1px solid #eee",
                            borderRadius: "8px",
                            padding: "10px",
                            marginBottom: "10px",
                            background: item.emUso ? "#f0fff0" : "#fff"
                        }
                    },
                        editandoId === item.id
                            ? renderFormEdicao()
                            : React.createElement("div", null,
                                React.createElement("div", { style: { textAlign: "left", marginBottom: "8px", lineHeight: "1.8" } },
                                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                                        React.createElement("strong", null, item.tipo),
                                        item.emUso && React.createElement("span", { style: { fontSize: "12px", background: "#2a7a2a", color: "#fff", borderRadius: "4px", padding: "2px 8px" } }, "Em uso")
                                    ),
                                    "Valor: R$ " + item.valor, React.createElement("br", null),
                                    "Peso: " + item.peso, React.createElement("br", null),
                                    "Compra: " + formatarData(item.dataCompra), React.createElement("br", null),
                                    "Duração: " + item.duracao
                                ),
                                React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
                                    React.createElement("button", {
                                        className: "botao",
                                        style: { ...btnSmall, background: item.emUso ? "#888" : "#2a7a2a" },
                                        onClick: () => toggleEmUso(item.id)
                                    }, item.emUso ? "Desmarcar uso" : "Marcar em uso"),
                                    React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => iniciarEdicao(item) }, "Editar"),
                                    React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#8b0000" }, onClick: () => excluir(item.id) }, "Excluir")
                                  )
                         )
                    )
                )
              ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// Menu principal de Ração — gerencia o estado compartilhado e a navegação entre subtópicos
const PaginaRacao = ({ itens, setItens, onVoltar, usuario, historico, setHistorico }) => {
    const [subpagina, setSubpagina] = useState(null);

    if (subpagina === "Nova Ração") {
        return React.createElement(NovaRacao, { itens, setItens, historico, setHistorico, usuario, onVoltar: () => setSubpagina(null) });
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, "Ração"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Nova Ração") }, "Nova Ração"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//                      GALINHAS

const camposVaziosGalinha = () => ({
    quantidade: "",
    tipo: "",
    origem: "nasceu",
    valor: "",
    dataCompra: dataHoje(),
    dataCadastro: dataHoje()
});

//config dos botão do menu
const renderFormGalinha = (dados, onChange, onConfirmar, labelConfirmar, onCancelar) => {
    const inputStyle = { margin: "4px 0" };
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };
    return React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "16px" } },
        React.createElement("input", { type: "number", placeholder: "Quantidade", value: dados.quantidade, onChange: (e) => onChange("quantidade", e.target.value), className: "input", style: inputStyle }),
        React.createElement("input", { type: "text", placeholder: "Tipo da galinha", value: dados.tipo, onChange: (e) => onChange("tipo", e.target.value.toUpperCase()), className: "input", style: inputStyle }),
        React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Origem"),
        React.createElement("select", { value: dados.origem, onChange: (e) => onChange("origem", e.target.value), className: "input", style: inputStyle },
            React.createElement("option", { value: "nasceu" }, "Nasceu aqui"),
            React.createElement("option", { value: "comprada" }, "Comprada")
        ),
        dados.origem === "nasceu" && React.createElement(React.Fragment, null,
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data de cadastro"),
            React.createElement("input", { type: "date", value: dados.dataCadastro || dataHoje(), onChange: (e) => onChange("dataCadastro", e.target.value), className: "input", style: inputStyle })
        ),
        dados.origem === "comprada" && React.createElement(React.Fragment, null,
            React.createElement("input", { type: "number", placeholder: "Valor (R$)", value: dados.valor, onChange: (e) => onChange("valor", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da compra"),
            React.createElement("input", { type: "date", value: dados.dataCompra, onChange: (e) => onChange("dataCompra", e.target.value), className: "input", style: inputStyle })
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "8px", justifyContent: "center" } },
            React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a" }, onClick: onConfirmar }, labelConfirmar),
            onCancelar && React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: onCancelar }, "Cancelar")
        )
    );
};

// 1Subtópico: cadastrar nova galinha
const NovaGalinha = ({ itens, setItens, historico, setHistorico, usuario, onVoltar }) => {
    const [form, setForm] = useState(camposVaziosGalinha());
    const setField = (field, value) => setForm({ ...form, [field]: value });
    

    const adicionar = () => {
        if (!form.tipo.trim() || !form.quantidade) return;
        const existente = itens.find((i) => i.tipo === form.tipo.trim() && i.origem === form.origem);
        if (existente) {
            const novaQtd = (parseInt(existente.quantidade) || 0) + (parseInt(form.quantidade) || 0);
            setItens(itens.map((i) => i.id === existente.id ? { ...i, quantidade: String(novaQtd) } : i));
            registrar(historico, setHistorico, "Soma", form.tipo + " (+" + form.quantidade + ")", usuario);
        } else {
            setItens([...itens, { id: Date.now(), ...form }]);
            registrar(historico, setHistorico, "Cadastro", form.tipo, usuario);
        }
        setForm(camposVaziosGalinha());
    };

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "🐔 Nova Galinha 🐔"),
        renderFormGalinha(form, setField, adicionar, "Cadastrar", null),
        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// Subtópico: listar, editar e excluir galinhas cadastradas
const GalinhasCadastradas = ({ itens, setItens, historico, setHistorico, usuario, onVoltar }) => {
    const [editandoId, setEditandoId] = useState(null);
    const [editandoForm, setEditandoForm] = useState(camposVaziosGalinha());
    const [ripMsg, setRipMsg] = useState("");
    const [excluindoId, setExcluindoId] = useState(null);
    const [qtdExcluir, setQtdExcluir] = useState("");
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };

    const confirmarExclusao = (id) => {
        const item = itens.find((i) => i.id === id);
        const qtd = parseInt(qtdExcluir) || 0;
        const atual = parseInt(item.quantidade) || 0;
        if (qtd <= 0 || qtd > atual) return;
        const restante = atual - qtd;
        if (restante === 0) {
            setItens(itens.filter((i) => i.id !== id));
            setRipMsg(qtd + " " + item.tipo + " MORREU 🐔💀");
        } else {
            setItens(itens.map((i) => i.id === id ? { ...i, quantidade: String(restante) } : i));
            setRipMsg(qtd + " " + item.tipo + " MORREU 🐔💀");
        }
        registrar(historico, setHistorico, "Exclusão", item.tipo + " (-" + qtd + ")", usuario);
        setExcluindoId(null);
        setQtdExcluir("");
        setTimeout(() => setRipMsg(""), 3000);
    };

    const iniciarEdicao = (item) => {
        setEditandoId(item.id);
        setEditandoForm({ quantidade: item.quantidade, tipo: item.tipo, origem: item.origem, valor: item.valor, dataCompra: item.dataCompra, dataCadastro: item.dataCadastro || dataHoje() });
    };

    const salvarEdicao = () => {
        if (!editandoForm.tipo.trim()) return;
        setItens(itens.map((item) => item.id === editandoId ? { ...item, ...editandoForm } : item));
        registrar(historico, setHistorico, "Alteração", editandoForm.tipo, usuario);
        setEditandoId(null);
        setEditandoForm(camposVaziosGalinha());
    };

    const setEditField = (field, value) => setEditandoForm({ ...editandoForm, [field]: value });

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "🐔 Todas Galinhas 🐔"),
        ripMsg && React.createElement("div", { style: { background: "#1a1a1a", color: "#fff", textAlign: "center", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "15px", fontWeight: "bold" } }, ripMsg),

        itens.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma galinha cadastrada.")
            : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0" } },
                itens.map((item) =>
                    React.createElement("li", {
                        key: item.id,
                        style: { border: "1px solid #eee", borderRadius: "8px", padding: "10px", marginBottom: "10px" }
                    },
                        editandoId === item.id
                            ? renderFormGalinha(editandoForm, setEditField, salvarEdicao, "Salvar", () => setEditandoId(null))
                            : React.createElement("div", null,
                                React.createElement("div", { style: { textAlign: "left", marginBottom: "8px", lineHeight: "1.8" } },
                                    React.createElement("strong", null, item.tipo), React.createElement("br", null),
                                    "Quantidade: " + item.quantidade, React.createElement("br", null),
                                    "Origem: " + (item.origem === "comprada" ? "Comprada" : "Nasceu aqui"),
                                    item.origem === "nasceu" && React.createElement(React.Fragment, null,
                                        React.createElement("br", null), "Data de cadastro: " + formatarData(item.dataCadastro)
                                    ),
                                    item.origem === "comprada" && React.createElement(React.Fragment, null,
                                        React.createElement("br", null), "Valor: R$ " + item.valor,
                                        React.createElement("br", null), "Data da compra: " + formatarData(item.dataCompra)
                                    )
                                ),
                                excluindoId === item.id
                                    ? React.createElement("div", { style: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "8px" } },
                                        React.createElement("span", { style: { fontSize: "13px" } }, "Quantas morreram? (max: " + item.quantidade + ")"),
                                        React.createElement("input", { type: "number", min: "1", max: item.quantidade, value: qtdExcluir, onChange: (e) => setQtdExcluir(e.target.value), className: "input", style: { width: "80px", margin: 0 } }),
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#8b0000" }, onClick: () => confirmarExclusao(item.id) }, "Confirmar"),
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => { setExcluindoId(null); setQtdExcluir(""); } }, "Cancelar")
                                    )
                                    : React.createElement("div", { style: { display: "flex", gap: "8px" } },
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => iniciarEdicao(item) }, "Editar"),
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#8b0000" }, onClick: () => { setExcluindoId(item.id); setQtdExcluir(""); } }, "Morreu")
                                    )
                              )
                    )
                )
              ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// Menu principal de Galinhas — gerencia o estado compartilhado e a navegação entre subtópicos
const PaginaGalinhas = ({ itens, setItens, onVoltar, usuario, historico, setHistorico }) => {
    const [subpagina, setSubpagina] = useState(null);

    if (subpagina === "Nova Galinha") {
        return React.createElement(NovaGalinha, { itens, setItens, historico, setHistorico, usuario, onVoltar: () => setSubpagina(null) });
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, "Galinhas"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Nova Galinha") }, "Nova Galinha"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//                          OVOS

const camposVaziosOvo = () => ({
    quantidade: "",
    dataColeta: dataHoje(),
    racaoUtilizada: "",
    quantidadeGalinhas: ""
});

// Subtópico: cadastrar, editar e excluir coletas de ovos
// Subtópico: apenas o formulário de cadastro de coleta
const NovaColeta = ({ coletas, setColetas, historico, setHistorico, usuario, itensRacao, itensGalinhas, onVoltar }) => {
    const totalGalinhas = itensGalinhas.reduce((acc, g) => acc + (parseInt(g.quantidade) || 0), 0);
    const [form, setForm] = useState({ ...camposVaziosOvo(), quantidadeGalinhas: totalGalinhas > 0 ? String(totalGalinhas) : "" });// puxa as galinhas para o campo de quantidade de galinhas
    const setField = (field, value) => setForm({ ...form, [field]: value });
    const inputStyle = { margin: "4px 0" };
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };

    const adicionar = () => {
        if (!form.quantidade || !form.dataColeta || !form.racaoUtilizada) return;
        setColetas([...coletas, { id: Date.now(), ...form }]);
        registrar(historico, setHistorico, "Cadastro", form.quantidade + " ovos", usuario);
        setForm(camposVaziosOvo());
    };

    if (itensRacao.length === 0) {
        return React.createElement("div", { className: "container" },
            React.createElement("h2", { style: { marginBottom: "16px" } }, "🥚 Nova Coleta 🥚"),
            React.createElement("div", { style: { background: "#fff3cd", border: "1px solid #f0a500", borderRadius: "8px", padding: "16px", textAlign: "center", marginBottom: "16px" } },
                React.createElement("p", { style: { margin: 0, color: "#856404", fontWeight: "bold" } }, "⚠️ Nenhuma ração cadastrada."),
                React.createElement("p", { style: { margin: "6px 0 0 0", color: "#856404", fontSize: "13px" } }, "Cadastre uma ração antes de registrar uma coleta.")
            ),
            React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
        );
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "🥚 Nova Coleta 🥚"),
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "16px" } },
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da coleta"),
            React.createElement("input", { type: "date", value: form.dataColeta, onChange: (e) => setField("dataColeta", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Quantidade de ovos recolhidos"),
            React.createElement("input", { type: "number", placeholder: "Quantidade", value: form.quantidade, onChange: (e) => setField("quantidade", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Ração utilizada no período"),
            itensRacao.length > 0
                ? React.createElement("select", { value: form.racaoUtilizada, onChange: (e) => setField("racaoUtilizada", e.target.value), className: "input", style: inputStyle },
                    React.createElement("option", { value: "" }, "Selecione a ração..."),
                    itensRacao.map((r) => React.createElement("option", { key: r.id, value: r.tipo }, r.tipo))
                  )
                : React.createElement("input", { type: "text", placeholder: "Ração utilizada", value: form.racaoUtilizada, onChange: (e) => setField("racaoUtilizada", e.target.value.toUpperCase()), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } },
                "Galinhas no espaço" + (totalGalinhas > 0 ? " (cadastradas: " + totalGalinhas + ")" : "")
            ),
            React.createElement("input", { type: "number", placeholder: "Quantidade de galinhas", value: form.quantidadeGalinhas, onChange: (e) => setField("quantidadeGalinhas", e.target.value), className: "input", style: inputStyle }),
            React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a", marginTop: "8px" }, onClick: adicionar }, "Cadastrar")
        ),
        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// Subtópico: listar, editar e excluir coletas
const TodasColetas = ({ coletas, setColetas, historico, setHistorico, usuario, itensRacao, itensGalinhas, onVoltar }) => {
    const [editandoId, setEditandoId] = useState(null);
    const [editandoForm, setEditandoForm] = useState(camposVaziosOvo());
    const [pagina, setPagina] = useState(1);
    const POR_PAG_COLETAS = 5;
    const totalGalinhas = itensGalinhas.reduce((acc, g) => acc + (parseInt(g.quantidade) || 0), 0);
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };
    const inputStyle = { margin: "4px 0" };

    const excluir = (id) => {
        const item = coletas.find((c) => c.id === id);
        registrar(historico, setHistorico, "Exclusão", item.quantidade + " ovos", usuario);
        setColetas(coletas.filter((c) => c.id !== id));
    };

    const iniciarEdicao = (item) => {
        setEditandoId(item.id);
        setEditandoForm({ dataColeta: item.dataColeta, quantidade: item.quantidade, racaoUtilizada: item.racaoUtilizada, quantidadeGalinhas: item.quantidadeGalinhas });
    };

    const salvarEdicao = () => {
        if (!editandoForm.quantidade || !editandoForm.dataColeta) return;
        setColetas(coletas.map((c) => c.id === editandoId ? { ...c, ...editandoForm } : c));
        registrar(historico, setHistorico, "Alteração", editandoForm.quantidade + " ovos", usuario);
        setEditandoId(null);
        setEditandoForm(camposVaziosOvo());
    };

    const setEditField = (field, value) => setEditandoForm({ ...editandoForm, [field]: value });

    const renderFormEdicao = () =>
        
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "8px" } },
            React.createElement("input", { type: "number", placeholder: "Quantidade de ovos", value: editandoForm.quantidade, onChange: (e) => setEditField("quantidade", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da coleta"),
            React.createElement("input", { type: "date", value: editandoForm.dataColeta, onChange: (e) => setEditField("dataColeta", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Ração utilizada"),
            itensRacao.length > 0
                ? React.createElement("select", { value: editandoForm.racaoUtilizada, onChange: (e) => setEditField("racaoUtilizada", e.target.value), className: "input", style: inputStyle },
                    React.createElement("option", { value: "" }, "Selecione a ração..."),
                    itensRacao.map((r) => React.createElement("option", { key: r.id, value: r.tipo }, r.tipo))
                  )
                : React.createElement("input", { type: "text", placeholder: "Ração utilizada", value: editandoForm.racaoUtilizada, onChange: (e) => setEditField("racaoUtilizada", e.target.value.toUpperCase()), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } },
                "Galinhas no espaço" + (totalGalinhas > 0 ? " (cadastradas: " + totalGalinhas + ")" : "")
            ),
            React.createElement("input", { type: "number", placeholder: "Quantidade de galinhas", value: editandoForm.quantidadeGalinhas, onChange: (e) => setEditField("quantidadeGalinhas", e.target.value), className: "input", style: inputStyle }),
            React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "8px" } },
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a" }, onClick: salvarEdicao }, "Salvar"),
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => setEditandoId(null) }, "Cancelar")
            )
        );

    const coletasOrdenadas = coletas.slice().sort((a, b) => b.dataColeta.localeCompare(a.dataColeta));
    const totalPaginas = Math.max(1, Math.ceil(coletasOrdenadas.length / POR_PAG_COLETAS));
    const itensPagina = coletasOrdenadas.slice((pagina - 1) * POR_PAG_COLETAS, pagina * POR_PAG_COLETAS);

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "🥚 Todas Coletas 🥚"),

        coletas.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma coleta cadastrada.")
            : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0" } },
                itensPagina.map((item) =>
                    React.createElement("li", {
                        key: item.id,
                        style: { border: "1px solid #eee", borderRadius: "8px", padding: "10px", marginBottom: "10px" }
                    },
                        editandoId === item.id
                            ? renderFormEdicao()
                            : React.createElement("div", null,
                                React.createElement("div", { style: { textAlign: "left", marginBottom: "8px", lineHeight: "1.8" } },
                                    React.createElement("strong", null, item.quantidade + " ovos"), React.createElement("br", null),
                                    "Data da coleta: " + formatarData(item.dataColeta), React.createElement("br", null),
                                    "Ração: " + (item.racaoUtilizada || "—"), React.createElement("br", null),
                                    "Galinhas no espaço: " + (item.quantidadeGalinhas || "—")
                                ),
                                React.createElement("div", { style: { display: "flex", gap: "8px" } },
                                    React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => iniciarEdicao(item) }, "Editar"),
                                    React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#8b0000" }, onClick: () => excluir(item.id) }, "Excluir")
                                )
                              )
                    )
                )
              ),

        totalPaginas > 1 && React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "16px" } },
            React.createElement("button", {
                className: "botao",
                style: { width: "auto", padding: "6px 14px", background: pagina === 1 ? "#ccc" : "#444" },
                disabled: pagina === 1,
                onClick: () => setPagina(pagina - 1)
            }, "←"),
            React.createElement("span", { style: { fontSize: "14px", color: "#555" } }, pagina + " / " + totalPaginas),
            React.createElement("button", {
                className: "botao",
                style: { width: "auto", padding: "6px 14px", background: pagina === totalPaginas ? "#ccc" : "#444" },
                disabled: pagina === totalPaginas,
                onClick: () => setPagina(pagina + 1)
            }, "→")
        ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// Menu principal de Ovos — gerencia o estado compartilhado e a navegação entre subtópicos
const PaginaOvos = ({ onVoltar, usuario, itensRacao, itensGalinhas, historico, setHistorico, coletas, setColetas }) => {
    const [subpagina, setSubpagina] = useState(null);

    if (subpagina === "Nova Coleta") {
        return React.createElement(NovaColeta, { coletas, setColetas, historico, setHistorico, usuario, itensRacao, itensGalinhas, onVoltar: () => setSubpagina(null) });
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, "Ovos"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Nova Coleta") }, "Nova Coleta"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//                    CONFIGURAÇÕES USUÁRIOS

const PaginaConfiguracoes = ({ onVoltar, usuarios, setUsuarios, perfilAtivo }) => {
    const [subpagina, setSubpagina] = useState(null);
    // Cadastro
    const [novoNome, setNovoNome] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [novoPerfil, setNovoPerfil] = useState("Usuário");
    const [msgCadastro, setMsgCadastro] = useState("");
    // Edição
    const [editandoIdx, setEditandoIdx] = useState(null);
    const [editForm, setEditForm] = useState({ nome: "", senha: "", perfil: "Usuário" });
    const [msgEdicao, setMsgEdicao] = useState("");

    const isAdmin = perfilAtivo === "Administrador";
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };

    const cadastrarUsuario = () => {
        if (!novoNome.trim() || !novaSenha.trim()) return;
        if (usuarios.find((u) => u.nome.toLowerCase() === novoNome.trim().toLowerCase())) {
            setMsgCadastro("Usuário já existe.");
            return;
        }
        setUsuarios([...usuarios, { nome: novoNome.trim(), senha: novaSenha.trim(), perfil: novoPerfil, dataCriacao: agora() }]);
        setMsgCadastro("Usuário cadastrado com sucesso!");
        setNovoNome("");
        setNovaSenha("");
        setNovoPerfil("Usuário");
    };

    const iniciarEdicao = (idx) => {
        setEditandoIdx(idx);
        setEditForm({ nome: usuarios[idx].nome, senha: usuarios[idx].senha, perfil: usuarios[idx].perfil || "Usuário" });
        setMsgEdicao("");
    };

    const salvarEdicao = () => {
        if (!editForm.nome.trim() || !editForm.senha.trim()) return;
        const duplicado = usuarios.find((u, i) => i !== editandoIdx && u.nome.toLowerCase() === editForm.nome.trim().toLowerCase());
        if (duplicado) { setMsgEdicao("Já existe um usuário com esse nome."); return; }
        setUsuarios(usuarios.map((u, i) => i === editandoIdx ? { nome: editForm.nome.trim(), senha: editForm.senha.trim(), perfil: editForm.perfil } : u));
        setEditandoIdx(null);
        setMsgEdicao("");
    };

    const excluirUsuario = (idx) => {
        setUsuarios(usuarios.filter((_, i) => i !== idx));
    };

    if (subpagina === "Idioma") {
        return React.createElement("div", { className: "container" },
            React.createElement("h2", { style: { marginBottom: "20px" } }, "Idioma"),
            React.createElement("p", { style: { textAlign: "center", color: "#888", fontSize: "16px", margin: "40px 0" } }, "🚧 Em manutenção 🚧"),
            React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: () => setSubpagina(null) }, "← Voltar")
        );
    }

    if (subpagina === "Cadastrar") {
        return React.createElement("div", { className: "container" },
            React.createElement("h2", { style: { marginBottom: "16px" } }, "Cadastrar Usuário"),
            React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "16px" } },
                React.createElement("input", { type: "text", placeholder: "Nome do usuário", value: novoNome, onChange: (e) => { setNovoNome(e.target.value); setMsgCadastro(""); }, className: "input", style: { margin: "4px 0" } }),
                React.createElement("input", { type: "password", placeholder: "Senha", value: novaSenha, onChange: (e) => { setNovaSenha(e.target.value); setMsgCadastro(""); }, className: "input", style: { margin: "4px 0" } }),
                React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Perfil"),
                React.createElement("select", { value: novoPerfil, onChange: (e) => setNovoPerfil(e.target.value), className: "input", style: { margin: "4px 0" } },
                    React.createElement("option", { value: "Usuário" }, "Usuário"),
                    React.createElement("option", { value: "Administrador" }, "Administrador")
                ),
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a", marginTop: "8px" }, onClick: cadastrarUsuario }, "Cadastrar"),
                msgCadastro && React.createElement("p", { style: { margin: "8px 0 0 0", fontSize: "13px", color: msgCadastro.includes("sucesso") ? "#2a7a2a" : "#8b0000" } }, msgCadastro)
            ),
            React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: () => setSubpagina(null) }, "← Voltar")
        );
    }

    if (subpagina === "Usuários") {
        return React.createElement("div", { className: "container" },
            React.createElement("h2", { style: { marginBottom: "16px" } }, "Usuários"),
            usuarios.length === 0
                ? React.createElement("p", { style: { color: "#999", textAlign: "center", marginBottom: "16px" } }, "Nenhum usuário cadastrado.")
                : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0" } },
                    usuarios.map((u, i) =>
                        React.createElement("li", {
                            key: i,
                            style: { border: "1px solid #eee", borderRadius: "8px", padding: "10px", marginBottom: "8px" }
                        },
                            isAdmin && editandoIdx === i
                                ? React.createElement("div", null,
                                    React.createElement("input", { type: "text", placeholder: "Nome", value: editForm.nome, onChange: (e) => setEditForm({ ...editForm, nome: e.target.value }), className: "input", style: { margin: "8px 0" } }),
                                    React.createElement("input", { type: "password", placeholder: "Senha", value: editForm.senha, onChange: (e) => setEditForm({ ...editForm, senha: e.target.value }), className: "input", style: { margin: "8px 0" } }),
                                    React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "10px" } }, "Perfil"),
                                    React.createElement("select", { value: editForm.perfil, onChange: (e) => setEditForm({ ...editForm, perfil: e.target.value }), className: "input", style: { margin: "8px 0" } },
                                        React.createElement("option", { value: "Usuário" }, "Usuário"),
                                        React.createElement("option", { value: "Administrador" }, "Administrador")
                                    ),
                                    msgEdicao && React.createElement("p", { style: { fontSize: "13px", color: "#8b0000", margin: "4px 0" } }, msgEdicao),
                                    React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "8px" } },
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a" }, onClick: salvarEdicao }, "Salvar"),
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => setEditandoIdx(null) }, "Cancelar")
                                    )
                                )
                                : React.createElement("div", null,
                                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" } },
                                        React.createElement("span", { style: { fontWeight: "bold" } }, u.nome),
                                        React.createElement("span", {
                                            style: {
                                                fontSize: "11px",
                                                background: u.perfil === "Administrador" ? "#1a5276" : "#555",
                                                color: "#fff",
                                                borderRadius: "4px",
                                                padding: "2px 8px"
                                            }
                                        }, u.perfil || "Usuário")
                                    ),
                                    u.dataCriacao && React.createElement("div", { style: { fontSize: "12px", color: "#888", marginTop: "4px", textAlign: "left" } },
                                        "📅 Criado em: " + u.dataCriacao
                                    ),
                                    isAdmin && React.createElement("hr", { style: { border: "none", borderTop: "1px solid #eee", margin: "10px 0" } }),
                                    isAdmin && React.createElement("div", { style: { display: "flex", gap: "8px" } },
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => iniciarEdicao(i) }, "Editar"),
                                        React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#8b0000" }, onClick: () => excluirUsuario(i) }, "Excluir")
                                    )
                                )
                        )
                    )
                ),
            React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: () => setSubpagina(null) }, "← Voltar")
        );
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, "⚙ Configurações"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Idioma") }, "🌐 Idioma"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Usuários") }, "👤 Usuários"),
        isAdmin && React.createElement("button", { className: "botao", style: { marginBottom: "10px", background: "#010101" }, onClick: () => setSubpagina("Cadastrar") }, "➕ Cadastrar Usuário"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//                          ANALYTICS

const ProducaoDiaria = ({ coletas, onVoltar }) => {
    const [dataInicio, setDataInicio] = useState(dataHoje());
    const [dataFim, setDataFim] = useState(dataHoje());
    const [buscou, setBuscou] = useState(false);

    const calcular = () => setBuscou(true);

    const coletasFiltradas = coletas.filter((c) => c.dataColeta >= dataInicio && c.dataColeta <= dataFim);

    const grupos = {};
    coletasFiltradas.forEach((c) => {
        const rac = c.racaoUtilizada || "—";
        if (!grupos[rac]) grupos[rac] = { totalOvos: 0, totalGalinhas: 0, contagem: 0 };
        grupos[rac].totalOvos += parseInt(c.quantidade) || 0;
        grupos[rac].totalGalinhas += parseInt(c.quantidadeGalinhas) || 0;
        grupos[rac].contagem += 1;
    });

    const linhas = coletasFiltradas
        .slice()
        .sort((a, b) => a.dataColeta.localeCompare(b.dataColeta))
        .map((c) => {
            const galinhas = parseInt(c.quantidadeGalinhas) || 0;
            const ovos = parseInt(c.quantidade) || 0;
            const produtividade = galinhas > 0 ? ((ovos / galinhas) * 100).toFixed(1) : "—";
            return { data: c.dataColeta, rac: c.racaoUtilizada || "—", galinhas, ovos, produtividade };
        });

    const thStyle = { padding: "8px 10px", background: "#222", color: "#fff", fontSize: "13px", textAlign: "center" };
    const tdStyle = { padding: "8px 10px", borderBottom: "1px solid #eee", fontSize: "13px", textAlign: "center" };

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "Produção Diária"),
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "10px", padding: "12px", marginBottom: "16px" } },
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginBottom: "4px" } }, "Data início"),
            React.createElement("input", { type: "date", value: dataInicio, onChange: (e) => { setDataInicio(e.target.value); setBuscou(false); }, className: "input", style: { margin: "4px 0" } }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px", marginBottom: "4px" } }, "Data fim"),
            React.createElement("input", { type: "date", value: dataFim, onChange: (e) => { setDataFim(e.target.value); setBuscou(false); }, className: "input", style: { margin: "4px 0" } }),
            React.createElement("button", { className: "botao", style: { width: "auto", padding: "6px 16px", marginTop: "10px", background: "#1a5276" }, onClick: calcular }, "Gerar")
        ),

        buscou && (linhas.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma coleta encontrada nesse período.")
            : React.createElement("div", { style: { overflowX: "auto", marginBottom: "16px" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { style: thStyle }, "Data"),
                            React.createElement("th", { style: thStyle }, "Tipo de Ração"),
                            React.createElement("th", { style: thStyle }, "Galinhas"),
                            React.createElement("th", { style: thStyle }, "Ovos"),
                            React.createElement("th", { style: thStyle }, "Produtividade (%)")
                        )
                    ),
                    React.createElement("tbody", null,
                        linhas.map((l, i) =>
                            React.createElement("tr", { key: i, style: { background: i % 2 === 0 ? "#fff" : "#f9f9f9" } },
                                React.createElement("td", { style: tdStyle }, formatarData(l.data)),
                                React.createElement("td", { style: tdStyle }, l.rac),
                                React.createElement("td", { style: tdStyle }, l.galinhas),
                                React.createElement("td", { style: tdStyle }, l.ovos),
                                React.createElement("td", { style: { ...tdStyle, fontWeight: "bold", color: "#2a7a2a" } }, l.produtividade + (l.produtividade !== "—" ? "%" : ""))
                            )
                        )
                    )
                )
            )
        ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

const EficaciaRacao = ({ coletas, onVoltar }) => {
    // Agrupa todas as coletas por ração (sem filtro de período)
    const grupos = {};
    coletas.forEach((c) => {
        const rac = c.racaoUtilizada || "—";
        if (!grupos[rac]) grupos[rac] = { totalOvos: 0, totalGalinhas: 0, contagem: 0 };
        grupos[rac].totalOvos += parseInt(c.quantidade) || 0;
        grupos[rac].totalGalinhas += parseInt(c.quantidadeGalinhas) || 0;
        grupos[rac].contagem += 1;
    });

    const linhas = Object.entries(grupos).map(([rac, v]) => {
        const galinhas = v.contagem > 0 ? Math.round(v.totalGalinhas / v.contagem) : 0;
        const produtividade = galinhas > 0 ? parseFloat(((v.totalOvos / galinhas) * 100).toFixed(1)) : 0;
        return { rac, galinhas, totalOvos: v.totalOvos, produtividade };
    }).sort((a, b) => b.produtividade - a.produtividade);

    const maxProd = linhas.length > 0 ? linhas[0].produtividade : 1;

    const thStyle = { padding: "8px 10px", background: "#222", color: "#fff", fontSize: "13px", textAlign: "center" };
    const tdStyle = { padding: "8px 10px", borderBottom: "1px solid #eee", fontSize: "13px", textAlign: "center" };

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "Eficácia por Ração"),

        coletas.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma coleta cadastrada.")
            : React.createElement(React.Fragment, null,
                React.createElement("p", { style: { fontSize: "13px", color: "#666", marginBottom: "12px", textAlign: "center" } },
                    "Comparativo de todas as rações utilizadas. A eficácia relativa indica o desempenho em relação à melhor ração."
                ),
                React.createElement("div", { style: { overflowX: "auto", marginBottom: "16px" } },
                    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", { style: thStyle }, "Ração"),
                                React.createElement("th", { style: thStyle }, "Total Ovos"),
                                React.createElement("th", { style: thStyle }, "Média Galinhas"),
                                React.createElement("th", { style: thStyle }, "Produtividade (%)"),
                                React.createElement("th", { style: thStyle }, "Eficácia Relativa")
                            )
                        ),
                        React.createElement("tbody", null,
                            linhas.map((l, i) => {
                                const eficacia = maxProd > 0 ? ((l.produtividade / maxProd) * 100).toFixed(1) : "—";
                                const isMelhor = i === 0 && l.produtividade > 0;
                                const rowStyle = {
                                    background: isMelhor ? "#f0fff0" : (i % 2 === 0 ? "#fff" : "#f9f9f9"),
                                    border: isMelhor ? "2px solid #2a7a2a" : "none"
                                };
                                return React.createElement("tr", { key: i, style: rowStyle },
                                    React.createElement("td", { style: { ...tdStyle, fontWeight: isMelhor ? "bold" : "normal" } },
                                        isMelhor ? " " + l.rac : l.rac
                                    ),
                                    React.createElement("td", { style: tdStyle }, l.totalOvos),
                                    React.createElement("td", { style: tdStyle }, l.galinhas),
                                    React.createElement("td", { style: { ...tdStyle, color: "#1a5276", fontWeight: "bold" } },
                                        l.produtividade > 0 ? l.produtividade + "%" : "—"
                                    ),
                                    React.createElement("td", { style: { ...tdStyle, fontWeight: "bold", color: isMelhor ? "#2a7a2a" : "#555" } },
                                        eficacia !== "—" ? eficacia + "%" : "—"
                                    )
                                );
                            })
                        )
                    )
                ),

              //  Barra visual de comparação
                React.createElement("div", { style: { marginBottom: "16px" } },
                    // React.createElement("p", { style: { fontSize: "13px", color: "#555", marginBottom: "8px", fontWeight: "bold" } }, "Comparativo visual"),
                    linhas.map((l, i) => {
                        const pct = maxProd > 0 ? (l.produtividade / maxProd) * 100 : 0;
                        const cor = i === 0 ? "#2a7a2a" : i === 1 ? "#1a5276" : "#888";
                        return React.createElement("div", { key: i, style: { marginBottom: "10px" } },
                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" } },
                                React.createElement("span", null, l.rac),
                                React.createElement("span", { style: { color: cor, fontWeight: "bold" } }, l.produtividade + "%")
                            ),
                            React.createElement("div", { style: { background: "#eee", borderRadius: "4px", height: "12px", overflow: "hidden" } },
                                React.createElement("div", { style: { width: pct + "%", background: cor, height: "100%", borderRadius: "4px", transition: "width 0.3s" } })
                            )
                        );
                    })
                )
            ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

const PaginaAnalytics = ({ onVoltar, coletas, itensRacao }) => {
    const [subpagina, setSubpagina] = useState(null);

    if (subpagina === "Produção Diária") {
        return React.createElement(ProducaoDiaria, { coletas, onVoltar: () => setSubpagina(null) });
    }

    if (subpagina === "Eficácia por Ração") {
        return React.createElement(EficaciaRacao, { coletas, onVoltar: () => setSubpagina(null) });
    }

    if (subpagina === "Ranking de Rações") {
        // Calcula ranking com base nos mesmos dados de EficaciaRacao/de/racao
        const grupos = {};
        coletas.forEach((c) => {
            const rac = c.racaoUtilizada || "—";
            if (!grupos[rac]) grupos[rac] = { totalOvos: 0, totalGalinhas: 0, contagem: 0 };
            grupos[rac].totalOvos += parseInt(c.quantidade) || 0;
            grupos[rac].totalGalinhas += parseInt(c.quantidadeGalinhas) || 0;
            grupos[rac].contagem += 1;
        });

        const ranking = Object.entries(grupos).map(([rac, v]) => {
            const galinhas = v.contagem > 0 ? Math.round(v.totalGalinhas / v.contagem) : 0;
            const produtividade = galinhas > 0 ? parseFloat(((v.totalOvos / galinhas) * 100).toFixed(1)) : 0;
            const infoRacao = itensRacao.find((r) => r.tipo === rac) || {};
            return { rac, galinhas, totalOvos: v.totalOvos, coletas: v.contagem, produtividade, valor: infoRacao.valor && infoRacao.valor !== "" ? infoRacao.valor : "—", duracao: infoRacao.duracao && infoRacao.duracao !== "" ? infoRacao.duracao : "—" };
        }).sort((a, b) => b.produtividade - a.produtividade);

        const maxProd = ranking.length > 0 ? ranking[0].produtividade : 1;

        const thStyle = { padding: "8px 10px", background: "#222", color: "#fff", fontSize: "13px", textAlign: "center" };
        const tdStyle = { padding: "10px", borderBottom: "1px solid #eee", fontSize: "13px", textAlign: "center" };

        return React.createElement("div", { className: "container" },
            React.createElement("h2", { style: { marginBottom: "16px" } }, "Ranking de Rações"),

            coletas.length === 0
                ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma coleta cadastrada.")
                : React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { overflowX: "auto", marginBottom: "20px" } },
                        React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                            React.createElement("thead", null,
                                React.createElement("tr", null,
                                    //React.createElement("th", { style: thStyle }, "#"),
                                    React.createElement("th", { style: thStyle }, "Ração"),
                                    React.createElement("th", { style: thStyle }, "Produtividade (%)"),
                                    React.createElement("th", { style: thStyle }, "Valor (R$)"),
                                    React.createElement("th", { style: thStyle }, "Duração")
                                )
                            ),
                            React.createElement("tbody", null,
                                ranking.map((l, i) => {
                                    const destaque = i === 0 && l.produtividade > 0;
                                    return React.createElement("tr", {
                                        key: i,
                                        style: {
                                            background: destaque ? "#f0fff0" : i % 2 === 0 ? "#fff" : "#f9f9f9",
                                            border: destaque ? "2px solid #2a7a2a" : "none"
                                        }
                                    },
                                        //React.createElement("td", { style: { ...tdStyle, fontWeight: "bold", fontSize: "16px" } }, "#" + (i + 1)),
                                        React.createElement("td", { style: { ...tdStyle, fontWeight: destaque ? "bold" : "normal", textAlign: "left" } }, l.rac),
                                        React.createElement("td", { style: { ...tdStyle, color: "#1a5276", fontWeight: "bold" } },
                                            l.produtividade > 0 ? l.produtividade + "%" : "—"
                                        ),
                                        React.createElement("td", { style: tdStyle }, l.valor !== "—" ? "R$ " + l.valor : "—"),
                                        React.createElement("td", { style: tdStyle }, l.duracao)
                                    );
                                })
                            )
                        )
                    ),

                    // Barras visuais
                    React.createElement("div", null,
                        // React.createElement("p", { style: { fontSize: "13px", color: "#555", marginBottom: "8px", fontWeight: "bold" } }, "Comparativo visual"),
                        // ranking.map((l, i) => {
                        //     const pct = maxProd > 0 ? (l.produtividade / maxProd) * 100 : 0;
                        //     const cores = ["#2a7a2a", "#1a5276", "#7d6608", "#888"];
                        //     const cor = cores[i] || "#aaa";
                        //     return React.createElement("div", { key: i, style: { marginBottom: "10px" } },
                        //         React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" } },
                        //             React.createElement("span", null, (medalhas[i] || "#" + (i + 1)) + " " + l.rac),
                        //             React.createElement("span", { style: { color: cor, fontWeight: "bold" } }, l.produtividade + "%")
                        //         ),
                        //         React.createElement("div", { style: { background: "#eee", borderRadius: "4px", height: "14px", overflow: "hidden" } },
                        //             React.createElement("div", { style: { width: pct + "%", background: cor, height: "100%", borderRadius: "4px" } })
                        //         )
                        //     );
                        // })
                    )
                ),

            React.createElement("button", { className: "botao", style: { background: "#444", marginTop: "16px" }, onClick: () => setSubpagina(null) }, "← Voltar")
        );
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, " 📊 Analytics"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Produção Diária") }, "Produção Diária"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Eficácia por Ração") }, "Eficácia por Ração"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Ranking de Rações") }, "Ranking de Rações"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//              HISTÓRICO GERAL

const POR_PAGINA = 5;

const PaginaHistoricoGeral = ({ historicoRacao, historicoGalinhas, historicoOvos, historicoVendas, onVoltar }) => {
    const [pagina, setPagina] = useState(1);

    const tudo = [
        ...historicoRacao.map((e) => ({ ...e, topico: "Ração" })),
        ...historicoGalinhas.map((e) => ({ ...e, topico: "Galinhas" })),
        ...historicoOvos.map((e) => ({ ...e, topico: "Ovos" })),
        ...historicoVendas.map((e) => ({ ...e, topico: "Vendas" }))
    ].sort((a, b) => {
        const parse = (s) => {
            if (!s) return 0;
            const [data, hora] = s.split(" ");
            const [dd, mm, yyyy] = data.split("/");
            return new Date(`${yyyy}-${mm}-${dd}T${hora}`);
        };
        return parse(b.dataHora) - parse(a.dataHora);
    });

    const totalPaginas = Math.max(1, Math.ceil(tudo.length / POR_PAGINA));
    const inicio = (pagina - 1) * POR_PAGINA;
    const paginaItens = tudo.slice(inicio, inicio + POR_PAGINA);

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "Histórico Geral"),

        tudo.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma ação registrada.")
            : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0", minHeight: (POR_PAGINA * 72) + "px" } },
                paginaItens.map((entry, i) =>
                    React.createElement("li", {
                        key: i,
                        style: { borderBottom: "1px solid #eee", padding: "8px 0", textAlign: "left", lineHeight: "1.7", fontSize: "14px" }
                    },
                        React.createElement("span", { style: { fontSize: "11px", background: "#ddd", borderRadius: "4px", padding: "2px 6px", marginRight: "6px" } }, entry.topico),
                        React.createElement("strong", null, entry.acao), " — ", entry.descricao,
                        React.createElement("br", null),
                        React.createElement("span", { style: { color: "#777" } }, "👤 " + entry.usuario + "  •   " + entry.dataHora)
                    )
                )
              ),

        totalPaginas > 1 && React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "16px" } },
            React.createElement("button", {
                className: "botao",
                style: { width: "auto", padding: "6px 14px", background: pagina === 1 ? "#ccc" : "#444" },
                disabled: pagina === 1,
                onClick: () => setPagina(pagina - 1)
            }, "←"),
            React.createElement("span", { style: { fontSize: "14px", color: "#555" } }, pagina + " / " + totalPaginas),
            React.createElement("button", {
                className: "botao",
                style: { width: "auto", padding: "6px 14px", background: pagina === totalPaginas ? "#ccc" : "#444" },
                disabled: pagina === totalPaginas,
                onClick: () => setPagina(pagina + 1)
            }, "→")
        ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//                                  Vendas
// ============================================================

const camposVaziosVenda = () => ({
    produto: "",
    quantidade: "",
    valor: "",
    data: dataHoje(),
    cliente: ""
});

const NovaVenda = ({ vendas, setVendas, historico, setHistorico, usuario, itensGalinhas, setItensGalinhas, coletas, onVoltar }) => {
    const [form, setForm] = useState(camposVaziosVenda());
    const [erro, setErro] = useState("");
    const setField = (field, value) => setForm({ ...form, [field]: value });
    const inputStyle = { margin: "4px 0" };
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };

    const isGalinha = form.produto.toLowerCase() === "galinha";
    const isOvo = form.produto.toLowerCase() === "ovo" || form.produto.toLowerCase() === "ovos";

    const calcularDisponivel = () => {
        if (isGalinha) {
            const estoqueGalinhas = form.tipoGalinha
                ? itensGalinhas.filter((g) => g.tipo === form.tipoGalinha).reduce((acc, g) => acc + (parseInt(g.quantidade) || 0), 0)
                : itensGalinhas.reduce((acc, g) => acc + (parseInt(g.quantidade) || 0), 0);
            const vendidasGalinhas = vendas
                .filter((v) => v.produto.toLowerCase() === "galinha" && (!form.tipoGalinha || v.tipoGalinha === form.tipoGalinha))
                .reduce((acc, v) => acc + (parseInt(v.quantidade) || 0), 0);
            return estoqueGalinhas - vendidasGalinhas;
        }
        if (isOvo) {
            const totalColetado = coletas.reduce((acc, c) => acc + (parseInt(c.quantidade) || 0), 0);
            const totalVendido = vendas
                .filter((v) => v.produto.toLowerCase() === "ovo" || v.produto.toLowerCase() === "ovos")
                .reduce((acc, v) => acc + (parseInt(v.quantidade) || 0), 0);
            return totalColetado - totalVendido;
        }
        return null;
    };

    const disponivel = calcularDisponivel();

    const adicionar = () => {
        if (!form.produto.trim() || !form.quantidade || !form.valor) return;
        if (isGalinha && !form.tipoGalinha) return;
        if (disponivel !== null && parseInt(form.quantidade) > disponivel) {
            setErro("Quantidade indisponível. Estoque: " + disponivel);
            return;
        }
        setErro("");
        setVendas([...vendas, { id: Date.now(), ...form }]);
        if (isGalinha && form.tipoGalinha) {
            setItensGalinhas(itensGalinhas.map((g) =>
                g.tipo === form.tipoGalinha
                    ? { ...g, quantidade: String(Math.max(0, (parseInt(g.quantidade) || 0) - parseInt(form.quantidade))) }
                    : g
            ));
        }
        registrar(historico, setHistorico, "Venda", form.produto + " (" + form.quantidade + "x)", usuario);
        setForm(camposVaziosVenda());
    };

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "Nova Venda"),
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "16px" } },
            React.createElement("select", { value: form.produto, onChange: (e) => { setErro(""); setForm((f) => ({ ...f, produto: e.target.value, tipoGalinha: "" })); }, className: "input", style: inputStyle },
                React.createElement("option", { value: "" }, "Selecione o produto..."),
                React.createElement("option", { value: "Galinha" }, "Galinha"),
                React.createElement("option", { value: "Ovos" }, "Ovos")
            ),
            isGalinha && itensGalinhas.length > 0
                ? React.createElement("select", { value: form.tipoGalinha || "", onChange: (e) => { setErro(""); setField("tipoGalinha", e.target.value); }, className: "input", style: inputStyle },
                    React.createElement("option", { value: "" }, "Selecione o tipo de galinha..."),
                    itensGalinhas.map((g) => React.createElement("option", { key: g.id, value: g.tipo }, g.tipo))
                  )
                : null,
            disponivel !== null && React.createElement("p", { style: { fontSize: "12px", color: "#555", margin: "4px 0" } }, "Disponível: " + disponivel),
            React.createElement("input", { type: "number", placeholder: "Quantidade", value: form.quantidade, onChange: (e) => { setErro(""); setField("quantidade", e.target.value); }, className: "input", style: inputStyle }),
            erro ? React.createElement("p", { style: { color: "#8b0000", fontSize: "13px", margin: "4px 0" } }, erro) : null,
            React.createElement("input", { type: "number", placeholder: "Valor total (R$)", value: form.valor, onChange: (e) => setField("valor", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "text", placeholder: "Cliente (opcional)", value: form.cliente, onChange: (e) => setField("cliente", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da venda"),
            React.createElement("input", { type: "date", value: form.data, onChange: (e) => setField("data", e.target.value), className: "input", style: inputStyle }),
            React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a", marginTop: "8px" }, onClick: adicionar }, "Cadastrar")
        ),
        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

const TodasVendas = ({ vendas, setVendas, historico, setHistorico, usuario, onVoltar }) => {
    const [editandoId, setEditandoId] = useState(null);
    const [editandoForm, setEditandoForm] = useState(camposVaziosVenda());
    const inputStyle = { margin: "4px 0" };
    const btnSmall = { width: "auto", margin: 0, padding: "6px 12px" };

    const excluir = (id) => {
        const item = vendas.find((v) => v.id === id);
        registrar(historico, setHistorico, "Exclusão de Venda", item.produto + " (" + item.quantidade + "x)", usuario);
        setVendas(vendas.filter((v) => v.id !== id));
    };

    const iniciarEdicao = (item) => {
        setEditandoId(item.id);
        setEditandoForm({ produto: item.produto, quantidade: item.quantidade, valor: item.valor, data: item.data, cliente: item.cliente || "" });
    };

    const salvarEdicao = () => {
        if (!editandoForm.produto.trim() || !editandoForm.quantidade || !editandoForm.valor) return;
        setVendas(vendas.map((v) => v.id === editandoId ? { ...v, ...editandoForm } : v));
        registrar(historico, setHistorico, "Alteração de Venda", editandoForm.produto + " (" + editandoForm.quantidade + "x)", usuario);
        setEditandoId(null);
        setEditandoForm(camposVaziosVenda());
    };

    const setEditField = (field, value) => setEditandoForm({ ...editandoForm, [field]: value });

    const renderFormEdicao = () =>
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "8px" } },
            React.createElement("input", { type: "text", placeholder: "Produto", value: editandoForm.produto, onChange: (e) => setEditField("produto", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "number", placeholder: "Quantidade", value: editandoForm.quantidade, onChange: (e) => setEditField("quantidade", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "number", placeholder: "Valor total (R$)", value: editandoForm.valor, onChange: (e) => setEditField("valor", e.target.value), className: "input", style: inputStyle }),
            React.createElement("input", { type: "text", placeholder: "Cliente (opcional)", value: editandoForm.cliente, onChange: (e) => setEditField("cliente", e.target.value), className: "input", style: inputStyle }),
            React.createElement("label", { style: { fontSize: "13px", color: "#555", display: "block", marginTop: "6px" } }, "Data da venda"),
            React.createElement("input", { type: "date", value: editandoForm.data, onChange: (e) => setEditField("data", e.target.value), className: "input", style: inputStyle }),
            React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "8px" } },
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#2a7a2a" }, onClick: salvarEdicao }, "Salvar"),
                React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#555" }, onClick: () => setEditandoId(null) }, "Cancelar")
            )
        );

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "16px" } }, "Todas as Vendas"),

        vendas.length === 0
            ? React.createElement("p", { style: { color: "#999", textAlign: "center" } }, "Nenhuma venda cadastrada.")
            : React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px 0" } },
                vendas.slice().sort((a, b) => b.data.localeCompare(a.data)).map((item) =>
                    React.createElement("li", { key: item.id, style: { border: "1px solid #eee", borderRadius: "8px", padding: "10px", marginBottom: "10px", background: "#fff" } },
                        editandoId === item.id
                            ? renderFormEdicao()
                            : React.createElement("div", null,
                                React.createElement("div", { style: { textAlign: "left", lineHeight: "1.8", marginBottom: "8px" } },
                                    React.createElement("strong", null, item.produto),
                                    item.tipoGalinha ? " — " + item.tipoGalinha : null,
                                    React.createElement("br", null),
                                    "Quantidade: " + item.quantidade,
                                    React.createElement("br", null),
                                    "Valor: R$ " + item.valor,
                                    React.createElement("br", null),
                                    item.cliente ? "Cliente: " + item.cliente : null,
                                    item.cliente ? React.createElement("br", null) : null,
                                    "Data: " + formatarData(item.data)
                                ),
                                React.createElement("div", { style: { display: "flex", gap: "8px" } },
                                    React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#1a5276" }, onClick: () => iniciarEdicao(item) }, "Editar"),
                                    React.createElement("button", { className: "botao", style: { ...btnSmall, background: "#8b0000" }, onClick: () => excluir(item.id) }, "Excluir")
                                )
                            )
                    )
                )
              ),

        React.createElement("button", { className: "botao", style: { background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

const PaginaVendas = ({ vendas, setVendas, onVoltar, usuario, historico, setHistorico, itensGalinhas, setItensGalinhas, coletas }) => {
    const [subpagina, setSubpagina] = useState(null);

    if (subpagina === "Nova Venda") {
        return React.createElement(NovaVenda, { vendas, setVendas, historico, setHistorico, usuario, itensGalinhas, setItensGalinhas, coletas, onVoltar: () => setSubpagina(null) });
    }

    if (subpagina === "Todas as Vendas") {
        return React.createElement(TodasVendas, { vendas, setVendas, historico, setHistorico, usuario, onVoltar: () => setSubpagina(null) });
    }

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, "Vendas"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Nova Venda") }, "Nova Venda"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Todas as Vendas") }, "Todas as Vendas"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};




// ============================================================
//                          ESTOQUE

const PaginaEstoque = ({ itensRacao, setItensRacao, itensGalinhas, setItensGalinhas, coletas, setColetas, historico, setHistorico, usuario, vendas, onVoltar }) => {
    const [subpagina, setSubpagina] = useState(null);

    const totalOvosVendidos = vendas
        .filter((v) => v.produto.toLowerCase() === "ovo" || v.produto.toLowerCase() === "ovos")
        .reduce((acc, v) => acc + (parseInt(v.quantidade) || 0), 0);
    const totalOvosColetados = coletas.reduce((acc, c) => acc + (parseInt(c.quantidade) || 0), 0);
    const ovosDisponiveis = totalOvosColetados - totalOvosVendidos;

    if (subpagina === "Todas Rações") {
        return React.createElement(TodasRacoes, { itens: itensRacao, setItens: setItensRacao, historico, setHistorico, usuario, onVoltar: () => setSubpagina(null) });
    }

    if (subpagina === "Galinhas Cadastradas") {
        return React.createElement(GalinhasCadastradas, { itens: itensGalinhas, setItens: setItensGalinhas, historico, setHistorico, usuario, onVoltar: () => setSubpagina(null) });
    }

    if (subpagina === "Todos os Ovos") {
        return React.createElement(TodasColetas, { coletas, setColetas, historico, setHistorico, usuario, itensRacao, itensGalinhas, onVoltar: () => setSubpagina(null) });
    }

    const totalGalinhas = itensGalinhas.reduce((acc, g) => acc + (parseInt(g.quantidade) || 0), 0);
    const totalGalinhasVendidas = vendas
        .filter((v) => v.produto.toLowerCase() === "galinha")
        .reduce((acc, v) => acc + (parseInt(v.quantidade) || 0), 0);

    return React.createElement("div", { className: "container" },
        React.createElement("h2", { style: { marginBottom: "20px" } }, "Estoque"),
        React.createElement("div", { style: { background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "16px", textAlign: "left", fontSize: "14px", lineHeight: "2" } },
            React.createElement("div", null, "🐔 Galinhas disponíveis: ", React.createElement("strong", null, totalGalinhas - totalGalinhasVendidas)),
            React.createElement("div", null, "🥚 Ovos disponíveis: ", React.createElement("strong", null, ovosDisponiveis)),
            React.createElement("div", null, "🥕 Rações cadastradas: ", React.createElement("strong", null, itensRacao.length))
        ),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Todas Rações") }, "Todas Rações"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Galinhas Cadastradas") }, "Galinhas Cadastradas"),
        React.createElement("button", { className: "botao", style: { marginBottom: "10px" }, onClick: () => setSubpagina("Todos os Ovos") }, "Todos os Ovos"),
        React.createElement("button", { className: "botao", style: { marginTop: "20px", background: "#444" }, onClick: onVoltar }, "← Voltar")
    );
};

// ============================================================
//              DASHBOARD — menu principal após login

const Dashboard = ({ onSair, usuario, perfilAtivo, usuarios, setUsuarios }) => {
    const [paginaAtiva, setPaginaAtiva] = useState(null);

    // Estado global compartilhado entre tópicos — carregado do localStorage
    const [itensRacao, setItensRacao] = useState(() => ls.get("fdg_racao", []));
    const [itensGalinhas, setItensGalinhas] = useState(() => ls.get("fdg_galinhas", []));
    const [coletas, setColetas] = useState(() => ls.get("fdg_coletas", []));

    // Históricos globais de cada tópico
    const [historicoRacao, setHistoricoRacao] = useState(() => ls.get("fdg_hist_racao", []));
    const [historicoGalinhas, setHistoricoGalinhas] = useState(() => ls.get("fdg_hist_galinhas", []));
    const [historicoOvos, setHistoricoOvos] = useState(() => ls.get("fdg_hist_ovos", []));
    const [historicoVendas, setHistoricoVendas] = useState(() => ls.get("fdg_hist_vendas", []));

    const [vendas, setVendas] = useState(() => ls.get("fdg_vendas", []));

    // Salva automaticamente no localStorage ao mudar
    useEffect(() => ls.set("fdg_racao", itensRacao), [itensRacao]);
    useEffect(() => ls.set("fdg_galinhas", itensGalinhas), [itensGalinhas]);
    useEffect(() => ls.set("fdg_coletas", coletas), [coletas]);
    useEffect(() => ls.set("fdg_vendas", vendas), [vendas]);
    useEffect(() => ls.set("fdg_hist_racao", historicoRacao), [historicoRacao]);
    useEffect(() => ls.set("fdg_hist_galinhas", historicoGalinhas), [historicoGalinhas]);
    useEffect(() => ls.set("fdg_hist_ovos", historicoOvos), [historicoOvos]);
    useEffect(() => ls.set("fdg_hist_vendas", historicoVendas), [historicoVendas]);

    const topicos = ["Ração", "Galinhas", "Ovos", "Estoque", "Analytics", "Vendas"];

    if (paginaAtiva === "Ração") {
        return React.createElement(PaginaRacao, { itens: itensRacao, setItens: setItensRacao, onVoltar: () => setPaginaAtiva(null), usuario, historico: historicoRacao, setHistorico: setHistoricoRacao });
    }

    if (paginaAtiva === "Galinhas") {
        return React.createElement(PaginaGalinhas, { itens: itensGalinhas, setItens: setItensGalinhas, onVoltar: () => setPaginaAtiva(null), usuario, historico: historicoGalinhas, setHistorico: setHistoricoGalinhas });
    }

    if (paginaAtiva === "Ovos") {
        return React.createElement(PaginaOvos, { onVoltar: () => setPaginaAtiva(null), usuario, itensRacao, itensGalinhas, historico: historicoOvos, setHistorico: setHistoricoOvos, coletas, setColetas });
    }

    if (paginaAtiva === "Estoque") {
        return React.createElement(PaginaEstoque, { itensRacao, setItensRacao, itensGalinhas, setItensGalinhas, coletas, setColetas, historico: historicoRacao, setHistorico: setHistoricoRacao, usuario, vendas, onVoltar: () => setPaginaAtiva(null) });
    }

    if (paginaAtiva === "Analytics") {
        return React.createElement(PaginaAnalytics, { onVoltar: () => setPaginaAtiva(null), coletas, itensRacao });
    }

    if (paginaAtiva === "Configurações") {
        return React.createElement(PaginaConfiguracoes, { onVoltar: () => setPaginaAtiva(null), usuarios, setUsuarios, perfilAtivo });
    }

    if (paginaAtiva === "Histórico") {
        return React.createElement(PaginaHistoricoGeral, { historicoRacao, historicoGalinhas, historicoOvos, historicoVendas, onVoltar: () => setPaginaAtiva(null) });
    }

    if (paginaAtiva === "Vendas") {
        return React.createElement(PaginaVendas, { vendas, setVendas, onVoltar: () => setPaginaAtiva(null), usuario, historico: historicoVendas, setHistorico: setHistoricoVendas, itensGalinhas, setItensGalinhas, coletas });
    }

    return React.createElement("div", { className: "container" },
        React.createElement("div", {
            style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f4f4f4",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px"
            }
        },
            React.createElement("div", { style: { textAlign: "left" } },
                React.createElement("div", { style: { fontWeight: "bold", fontSize: "14px", color: "#222" } }, usuario),
                React.createElement("div", {
                    style: {
                        fontSize: "11px",
                        marginTop: "2px",
                        background: perfilAtivo === "Administrador" ? "#1a5276" : "#555",
                        color: "#fff",
                        borderRadius: "4px",
                        padding: "2px 7px",
                        display: "inline-block"
                    }
                }, perfilAtivo)
            ),
            React.createElement("div", { style: { display: "flex", gap: "6px" } },
                React.createElement("button", {
                    style: { background: "none", border: "1px solid #ccc", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "16px" },
                    title: "Configurações",
                    onClick: () => setPaginaAtiva("Configurações")
                }, "⚙"),
                React.createElement("button", {
                    style: { background: "#8b0000", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "13px", color: "#fff", fontWeight: "bold" },
                    title: "Sair",
                    onClick: onSair
                }, "Sair")
            )
        ),

        React.createElement("h2", { style: { marginBottom: "20px" } }, "MENU"),

        topicos.map((topico) =>
            React.createElement("button", { key: topico, className: "botao", style: { marginBottom: "10px" }, onClick: () => setPaginaAtiva(topico) }, topico)
        ),

        React.createElement("button", { className: "botao", style: { marginBottom: "10px", background: "#1a5276" }, onClick: () => setPaginaAtiva("Histórico") }, "Histórico"),

        React.createElement("p", { style: { marginTop: "24px", fontSize: "12px", color: "#aaa", textAlign: "center" } }, "By CarrotsGroup")
    );
};

// ============================================================
//                       LOGIN

const FugaDasGalinhas = () => {
    const [Nome, setNome] = useState("");
    const [Senha, setSenha] = useState("");
    const [logado, setLogado] = useState(false);
    const [erroLogin, setErroLogin] = useState("");
    const [usuarios, setUsuarios] = useState(() => ls.get("fdg_usuarios", []));
    useEffect(() => ls.set("fdg_usuarios", usuarios), [usuarios]);

    const [perfilAtivo, setPerfilAtivo] = useState("Administrador");

    const Logar = () => {
        if (!Nome || !Senha) return;
        // Se não há usuários cadastrados, aceita qualquer credencial como Administrador
        if (usuarios.length === 0) {
            setPerfilAtivo("Administrador");
            setLogado(true);
            setErroLogin("");
            return;
        }
        const encontrado = usuarios.find((u) => u.nome.toLowerCase() === Nome.trim().toLowerCase() && u.senha === Senha);
        if (encontrado) {
            setPerfilAtivo(encontrado.perfil || "Usuário");
            setLogado(true);
            setErroLogin("");
        } else {
            setErroLogin("Usuário ou senha incorretos.");
        }
    };

    if (logado) {
        return React.createElement(Dashboard, { onSair: () => { setLogado(false); setNome(""); setSenha(""); }, usuario: Nome, perfilAtivo, usuarios, setUsuarios });
    }

    return React.createElement("div", { className: "container" },
        React.createElement("img", { src: "logo.png", alt: "Logo", style: { width: "100px", height: "100px", objectFit: "contain", display: "block", margin: "0 auto 8px auto" } }),
        React.createElement("h2", { style: { marginBottom: "20px" } }, "Chickens Eat Carrots"),
        React.createElement("input", { type: "text", placeholder: "Nome", value: Nome, onChange: (e) => { setNome(e.target.value); setErroLogin(""); }, className: "input" }),
        React.createElement("input", { type: "password", placeholder: "Senha", value: Senha, onChange: (e) => { setSenha(e.target.value); setErroLogin(""); }, className: "input" }),
        erroLogin && React.createElement("p", { style: { color: "#8b0000", fontSize: "13px", margin: "4px 0" } }, erroLogin),
        React.createElement("button", { onClick: Logar, className: "botao" }, "Logar"),
        React.createElement("p", { style: { marginTop: "24px", fontSize: "12px", color: "#aaa", textAlign: "center" } }, "By CarrotsGroup")
    );
};

// ============================================================
//                      INICIALIZAÇÃO

const FDG = () => React.createElement(FugaDasGalinhas);

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(React.createElement(FDG));
