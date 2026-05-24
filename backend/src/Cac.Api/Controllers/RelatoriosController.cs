using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/relatorios")]
[Authorize]
public sealed class RelatoriosController : ControllerBase
{
    private readonly RelatorioService _service;

    public RelatoriosController(RelatorioService service)
    {
        _service = service;
    }

    [HttpGet("consumo-por-setor")]
    [Authorize(Roles = "GESTOR_SETOR,GERENTE_COMPRAS,DIRETOR,FINANCEIRO,TI")]
    public async Task<ActionResult<IEnumerable<ConsumoPorSetorItemDto>>> ConsumoPorSetor(
        [FromQuery] ConsumoPorSetorQueryDto query)
    {
        var result = await _service.ConsumoPorSetorAsync(query);
        return Ok(result);
    }

    [HttpGet("ficha-produto/{idProduto:int}")]
    [Authorize(Roles = "COMPRADOR,ALMOXARIFE,GERENTE_COMPRAS,FINANCEIRO,TI")]
    public async Task<ActionResult<IEnumerable<FichaProdutoItemDto>>> FichaProduto(
        int idProduto,
        [FromQuery] FichaProdutoQueryDto query)
    {
        var result = await _service.FichaProdutoAsync(idProduto, query);
        return Ok(result);
    }

    [HttpGet("fornecedores-por-produto")]
    [Authorize(Roles = "COMPRADOR,ALMOXARIFE,GERENTE_COMPRAS,TI")]
    public async Task<ActionResult<IEnumerable<FornecedoresPorProdutoItemDto>>> FornecedoresPorProduto(
        [FromQuery] FornecedoresPorProdutoQueryDto query)
    {
        var result = await _service.FornecedoresPorProdutoAsync(query);
        return Ok(result);
    }

    [HttpGet("produtos-em-falta")]
    [Authorize(Roles = "COMPRADOR,ALMOXARIFE,GERENTE_COMPRAS,DIRETOR,TI")]
    public async Task<ActionResult<IEnumerable<ProdutosEmFaltaItemDto>>> ProdutosEmFalta(
        [FromQuery] ProdutosEmFaltaQueryDto query)
    {
        var result = await _service.ProdutosEmFaltaAsync(query);
        return Ok(result);
    }

    [HttpGet("menor-preco-por-produto")]
    [Authorize(Roles = "COMPRADOR,GERENTE_COMPRAS,FINANCEIRO,TI")]
    public async Task<ActionResult<IEnumerable<MenorPrecoPorProdutoItemDto>>> MenorPrecoPorProduto(
        [FromQuery] MenorPrecoPorProdutoQueryDto query)
    {
        var result = await _service.MenorPrecoPorProdutoAsync(query);
        return Ok(result);
    }
}
