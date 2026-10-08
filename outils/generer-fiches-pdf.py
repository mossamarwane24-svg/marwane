#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère les versions PDF des fiches de révision 5ème (aires & pourcentages)
à partir d'une petite description de contenu.

Usage : python3 outils/generer-fiches-pdf.py
Sortie : fiche-revision-maths-5e.pdf et exercices-maths-5e.pdf (racine du dépôt)
"""

import os
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)

# ---------------------------------------------------------------- couleurs
BLEU = colors.HexColor("#2563eb")
BLEU_CLAIR = colors.HexColor("#eaf1ff")
BLEU_FONCE = colors.HexColor("#1e3a8a")
ORANGE = colors.HexColor("#ea7317")
ORANGE_CLAIR = colors.HexColor("#fff2e5")
ORANGE_FONCE = colors.HexColor("#8a3d00")
VERT = colors.HexColor("#15803d")
VERT_CLAIR = colors.HexColor("#e8f7ee")
VERT_FONCE = colors.HexColor("#14532d")
ROUGE = colors.HexColor("#dc2626")
ROUGE_CLAIR = colors.HexColor("#fdecec")
JAUNE = colors.HexColor("#a16207")
JAUNE_CLAIR = colors.HexColor("#fff9e0")
VIOLET = colors.HexColor("#7c3aed")
VIOLET_CLAIR = colors.HexColor("#f3ecff")
GRIS = colors.HexColor("#334155")
GRIS_CLAIR = colors.HexColor("#f4f6fb")

FONT_DIR = "/usr/share/fonts/truetype/dejavu/"


def register_fonts():
    pdfmetrics.registerFont(TTFont("DJ", FONT_DIR + "DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("DJ-B", FONT_DIR + "DejaVuSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("DJM", FONT_DIR + "DejaVuSansMono.ttf"))
    pdfmetrics.registerFont(TTFont("DJM-B", FONT_DIR + "DejaVuSansMono-Bold.ttf"))
    pdfmetrics.registerFontFamily("DJ", normal="DJ", bold="DJ-B",
                                  italic="DJ", boldItalic="DJ-B")


# ---------------------------------------------------------------- styles
def styles():
    s = {}
    s["body"] = ParagraphStyle("body", fontName="DJ", fontSize=10.5, leading=15.5,
                               textColor=GRIS, spaceAfter=5, alignment=TA_LEFT)
    s["small"] = ParagraphStyle("small", parent=s["body"], fontSize=9, leading=13,
                                textColor=colors.HexColor("#64748b"))
    s["h2"] = ParagraphStyle("h2", fontName="DJ-B", fontSize=16, leading=20,
                             textColor=BLEU_FONCE, spaceBefore=14, spaceAfter=2)
    s["h3"] = ParagraphStyle("h3", fontName="DJ-B", fontSize=12, leading=16,
                             textColor=colors.HexColor("#1e293b"),
                             spaceBefore=11, spaceAfter=4)
    s["form"] = ParagraphStyle("form", fontName="DJ-B", fontSize=12.5, leading=18,
                               textColor=BLEU_FONCE, alignment=TA_CENTER)
    s["form_o"] = ParagraphStyle("form_o", parent=s["form"], textColor=ORANGE_FONCE)
    s["boxtext"] = ParagraphStyle("boxtext", fontName="DJ", fontSize=10, leading=14.5,
                                  textColor=GRIS)
    s["boxtext_b"] = ParagraphStyle("boxtext_b", parent=s["boxtext"],
                                    textColor=JAUNE)
    s["boxtext_r"] = ParagraphStyle("boxtext_r", parent=s["boxtext"],
                                    textColor=VERT_FONCE)
    s["boxtitre"] = ParagraphStyle("boxtitre", fontName="DJ-B", fontSize=10.5,
                                   leading=14.5, spaceAfter=3)
    s["titre_doc"] = ParagraphStyle("titre_doc", fontName="DJ-B", fontSize=21,
                                    leading=25, textColor=colors.white,
                                    alignment=TA_CENTER)
    s["sous_doc"] = ParagraphStyle("sous_doc", fontName="DJ", fontSize=11.5,
                                   leading=16, textColor=colors.HexColor("#dbeafe"),
                                   alignment=TA_CENTER)
    s["memo"] = ParagraphStyle("memo", fontName="DJ", fontSize=10.5, leading=15,
                               textColor=colors.white)
    s["cell"] = ParagraphStyle("cell", fontName="DJ", fontSize=9.5, leading=13,
                               textColor=GRIS)
    s["cell_c"] = ParagraphStyle("cell_c", parent=s["cell"], alignment=TA_CENTER)
    s["cell_h"] = ParagraphStyle("cell_h", parent=s["cell"], fontName="DJ-B",
                                 alignment=TA_CENTER,
                                 textColor=colors.HexColor("#1e293b"))
    s["exo_t"] = ParagraphStyle("exo_t", fontName="DJ-B", fontSize=11.5, leading=15,
                                textColor=BLEU_FONCE, spaceAfter=3)
    s["exo_t2"] = ParagraphStyle("exo_t2", parent=s["exo_t"], textColor=VIOLET)
    s["exo_t3"] = ParagraphStyle("exo_t3", parent=s["exo_t"], textColor=ORANGE_FONCE)
    s["exo_t4"] = ParagraphStyle("exo_t4", parent=s["exo_t"], textColor=JAUNE)
    s["exo_t5"] = ParagraphStyle("exo_t5", parent=s["exo_t"], textColor=ROUGE)
    return s


ST = {}


# ---------------------------------------------------------------- outils
MONO_RE = re.compile(r"`([^`]+)`")


def fmt(t):
    """Transforme `calc` en police monospace."""
    return MONO_RE.sub(
        lambda m: '<font name="DJM" size="9.6" color="#1e293b">%s</font>' % m.group(1), t
    )


def box(flowables, bg, bord, pad=8):
    """Encadré coloré avec une barre de couleur à gauche."""
    t = Table([[flowables]], colWidths=[None])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 4, bord),
        ("LEFTPADDING", (0, 0), (-1, -1), pad + 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), pad - 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad - 2),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def steps(items, color=VERT):
    out = []
    for i, it in enumerate(items, 1):
        out.append(Paragraph(
            '<font name="DJ-B" color="#%s">%d.</font> %s' % (color.hexval()[2:], i, fmt(it)),
            ST["boxtext"]))
    return out


# ------------------------------------------------------- dessins (figures)
class Figure(Flowable):
    """Un dessin vectoriel placé dans le flux du document."""

    def __init__(self, width, height, drawer):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.drawer = drawer

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)

    def draw(self):
        self.drawer(self.canv, self.width, self.height)


CASE = colors.HexColor("#dbeafe")
CASE2 = colors.HexColor("#eff6ff")
BORD = colors.HexColor("#93c5fd")


def d_rectangle_grille(c, w, h):
    """Un rectangle 4 x 3 rempli de 12 petits carrés numérotés."""
    cols, rows, cell = 4, 3, 32
    x0, y0 = 46, 24
    gw, gh = cols * cell, rows * cell
    n = 1
    for j in range(rows):
        for i in range(cols):
            x, y = x0 + i * cell, y0 + j * cell
            c.setFillColor(CASE if (i + j) % 2 == 0 else CASE2)
            c.setStrokeColor(BORD)
            c.setLineWidth(0.7)
            c.rect(x, y, cell, cell, fill=1, stroke=1)
            c.setFillColor(BLEU_FONCE)
            c.setFont("DJ", 8)
            c.drawCentredString(x + cell / 2, y + cell / 2 - 2.8, str(n))
            n += 1
    c.setStrokeColor(BLEU_FONCE)
    c.setLineWidth(2)
    c.rect(x0, y0, gw, gh, fill=0, stroke=1)

    # cote "4 cm"
    yb = y0 + gh + 17
    c.setStrokeColor(ROUGE)
    c.setLineWidth(0.9)
    c.line(x0, yb, x0 + gw, yb)
    c.line(x0, yb - 4, x0, yb + 4)
    c.line(x0 + gw, yb - 4, x0 + gw, yb + 4)
    c.setFillColor(ROUGE)
    c.setFont("DJ-B", 9)
    c.drawCentredString(x0 + gw / 2, yb + 5, "4 cm")

    # cote "3 cm"
    xb = x0 - 17
    c.line(xb, y0, xb, y0 + gh)
    c.line(xb - 4, y0, xb + 4, y0)
    c.line(xb - 4, y0 + gh, xb + 4, y0 + gh)
    c.saveState()
    c.translate(xb - 7, y0 + gh / 2)
    c.rotate(90)
    c.drawCentredString(0, 0, "3 cm")
    c.restoreState()

    # explications a droite
    c.setFillColor(BLEU_FONCE)
    c.setFont("DJ-B", 10.5)
    c.drawString(215, 104, "4 carrés par rangée")
    c.drawString(215, 88, "3 rangées")
    c.setFont("DJ", 10.5)
    c.setFillColor(GRIS)
    c.drawString(215, 68, "4 × 3 = 12 carrés")
    c.setFont("DJ-B", 10.5)
    c.setFillColor(VERT_FONCE)
    c.drawString(215, 50, "= 12 cm² d'aire")


def d_carre(c, w, h):
    """Le carré : un rectangle particulier."""
    cell = 30
    x0, y0 = 40, 20
    for j in range(3):
        for i in range(3):
            x, y = x0 + i * cell, y0 + j * cell
            c.setFillColor(CASE if (i + j) % 2 == 0 else CASE2)
            c.setStrokeColor(BORD)
            c.setLineWidth(0.7)
            c.rect(x, y, cell, cell, fill=1, stroke=1)
    c.setStrokeColor(BLEU_FONCE)
    c.setLineWidth(2)
    c.rect(x0, y0, 3 * cell, 3 * cell, fill=0, stroke=1)

    yb = y0 + 3 * cell + 17
    c.setStrokeColor(ROUGE)
    c.setLineWidth(0.9)
    c.line(x0, yb, x0 + 3 * cell, yb)
    c.line(x0, yb - 4, x0, yb + 4)
    c.line(x0 + 3 * cell, yb - 4, x0 + 3 * cell, yb + 4)
    c.setFillColor(ROUGE)
    c.setFont("DJ-B", 9)
    c.drawCentredString(x0 + 1.5 * cell, yb + 5, "c")

    c.setFillColor(BLEU_FONCE)
    c.setFont("DJ-B", 10.5)
    c.drawString(180, 100, "Le carré, c'est un rectangle")
    c.drawString(180, 84, "où la longueur et la largeur")
    c.drawString(180, 68, "sont égales.")
    c.setFont("DJ", 10.5)
    c.setFillColor(GRIS)
    c.drawString(180, 46, "L × l  devient  côté × côté")


def d_triangle(c, w, h):
    """Un triangle + le même retourné = un parallélogramme."""
    b, ht, dx = 58.0, 52.0, 28.0
    dec = 60.0                      # decalage vertical des panneaux

    def poly(pts, fill, stroke, lw=1.2, dash=None):
        p = c.beginPath()
        p.moveTo(*pts[0])
        for q in pts[1:]:
            p.lineTo(*q)
        p.close()
        c.setFillColor(fill)
        c.setStrokeColor(stroke)
        c.setLineWidth(lw)
        if dash:
            c.setDash(*dash)
        c.drawPath(p, fill=1, stroke=1)
        if dash:
            c.setDash()

    # ---- panneau 1 : le triangle
    t1 = [(10, dec), (10 + b, dec), (10 + b + dx, dec + ht)]
    poly(t1, colors.HexColor("#bfdbfe"), BLEU)
    c.setFont("DJ-B", 11)
    c.setFillColor(BLEU_FONCE)
    c.drawCentredString(58, dec + 19, "1")

    # ---- panneau 2 : le même, retourné
    t2 = [(124 + b + dx, dec + ht), (124 + dx, dec + ht), (124, dec)]
    poly(t2, colors.HexColor("#dbeafe"), BLEU)
    c.setFillColor(BLEU_FONCE)
    c.drawCentredString(148, dec + 21, "1")

    # ---- operateurs
    c.setFillColor(GRIS)
    c.setFont("DJ-B", 15)
    c.drawCentredString(108, dec + 22, "+")
    c.setFillColor(GRIS)
    c.drawCentredString(228, dec + 22, "=")

    # ---- panneau 3 : le parallelogramme obtenu
    pa = [(240, dec), (240 + b, dec), (240 + b + dx, dec + ht), (240 + dx, dec + ht)]
    poly(pa, colors.HexColor("#eff6ff"), BLEU, lw=1.4)
    # la diagonale commune aux deux triangles
    c.setStrokeColor(BLEU_FONCE)
    c.setLineWidth(1.6)
    c.line(240, dec, 240 + b + dx, dec + ht)
    c.setFillColor(BLEU_FONCE)
    c.setFont("DJ-B", 10)
    c.drawCentredString(289, dec + 13, "1")
    c.drawCentredString(277, dec + 32, "1")

    # ---- legende
    c.setFont("DJ", 8.6)
    c.setFillColor(GRIS)
    c.drawCentredString(48, dec - 13, "1 triangle")
    c.drawCentredString(167, dec - 13, "le même, retourné")
    c.drawCentredString(284, dec - 13, "= 1 parallélogramme")

    # ---- conclusion
    c.setFont("DJ", 9.4)
    c.setFillColor(GRIS)
    c.drawCentredString(w / 2, 22,
                        "Un parallélogramme a la même aire qu'un rectangle de « base × hauteur ».")
    c.setFont("DJ-B", 10.2)
    c.setFillColor(VERT_FONCE)
    c.drawCentredString(w / 2, 7, "Donc l'aire d'1 triangle = (base × hauteur) ÷ 2")


def d_disque(c, w, h):
    """Le disque et son rayon."""
    cx, cy, r = 92, 76, 58
    c.setFillColor(CASE)
    c.setStrokeColor(BLEU)
    c.setLineWidth(2)
    c.circle(cx, cy, r, fill=1, stroke=1)
    # rayon
    c.setStrokeColor(ROUGE)
    c.setLineWidth(1.5)
    c.setDash(4, 3)
    c.line(cx, cy, cx + r, cy)
    c.setDash()
    c.setFillColor(ROUGE)
    c.circle(cx, cy, 3, fill=1, stroke=0)
    c.setFont("DJ-B", 11)
    c.drawString(cx + r / 2 - 8, cy + 5, "r")
    # diametre
    c.setStrokeColor(colors.HexColor("#94a3b8"))
    c.setLineWidth(1.2)
    c.setDash(3, 3)
    c.line(cx - r, cy, cx + r, cy)
    c.setDash()

    c.setFillColor(BLEU_FONCE)
    c.setFont("DJ-B", 10.5)
    c.drawString(200, 108, "Un disque n'est pas rempli")
    c.drawString(200, 92, "de carrés (le bord est rond).")
    c.setFont("DJ", 10.5)
    c.setFillColor(GRIS)
    c.drawString(200, 72, "Donc on la retient par cœur :")
    c.setFont("DJ-B", 12)
    c.setFillColor(BLEU_FONCE)
    c.drawString(200, 52, "A = π × r × r")
    c.setFont("DJ", 10)
    c.setFillColor(GRIS)
    c.drawString(200, 34, "π se dit « pi » et vaut ≈ 3,14")


def d_pourcent(c, w, h):
    """Grille de 100 cases dont 25 colorees."""
    cell = 13.5
    cols, rows = 10, 10
    x0, y0 = 30, 18
    n = 0
    for j in range(rows - 1, -1, -1):
        for i in range(cols):
            x, y = x0 + i * cell, y0 + j * cell
            if n < 25:
                c.setFillColor(colors.HexColor("#fdba74"))
            else:
                c.setFillColor(colors.HexColor("#fff7ed"))
            c.setStrokeColor(colors.HexColor("#fdba74") if n < 25
                             else colors.HexColor("#fed7aa"))
            c.setLineWidth(0.6)
            c.rect(x, y, cell, cell, fill=1, stroke=1)
            n += 1
    c.setStrokeColor(ORANGE)
    c.setLineWidth(2)
    c.rect(x0, y0, cols * cell, rows * cell, fill=0, stroke=1)

    c.setFillColor(ORANGE_FONCE)
    c.setFont("DJ-B", 11)
    c.drawString(190, 128, "25 cases coloriées")
    c.setFont("DJ", 11)
    c.setFillColor(GRIS)
    c.drawString(190, 110, "sur les 100 cases")
    c.setFont("DJ-B", 12)
    c.setFillColor(ORANGE_FONCE)
    c.drawString(190, 86, "= 25 %")
    c.setFont("DJ", 10.5)
    c.setFillColor(GRIS)
    c.drawString(190, 60, "« pour cent » = « sur 100 »")
    c.setFont("DJ-B", 12)
    c.setFillColor(BLEU_FONCE)
    c.drawString(190, 30, "25 % de 60 = (25 ÷ 100) × 60")


def exo(num, titre, rappel, consigne, correction, resultat, style="exo_t"):
    """Un bloc exercice : énoncé + rappel + correction."""
    blocs = []
    blocs.append(Paragraph("Exercice %s — %s" % (num, titre), ST[style]))
    if rappel:
        blocs.append(Paragraph("Rappel : " + fmt(rappel), ST["small"]))
    blocs.append(Paragraph(fmt(consigne), ST["body"]))
    corr = [Paragraph("Correction", ST["boxtitre"])] + steps(correction)
    if resultat:
        corr.append(Spacer(1, 3))
        corr.append(Paragraph("<b>%s</b>" % fmt(resultat), ST["boxtext_r"]))
    blocs.append(box(corr, VERT_CLAIR, VERT))
    blocs.append(Spacer(1, 9))
    return KeepTogether(blocs)


def render(story, content):
    for item in content:
        kind = item[0]
        if kind == "h1":
            story.append(Spacer(1, 4))
            t = Table([[Paragraph(item[1], ST["titre_doc"])],
                       [Paragraph(item[2], ST["sous_doc"])]], colWidths=[None])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BLEU_FONCE),
                ("TOPPADDING", (0, 0), (-1, 0), 14),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
                ("TOPPADDING", (0, 1), (-1, 1), 0),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 14),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ]))
            story.append(t)
            story.append(Spacer(1, 12))
        elif kind == "h2":
            story.append(Paragraph(item[1], ST["h2"]))
            story.append(HRFlowable(width="100%", thickness=1.6,
                                    color=item[2] if len(item) > 2 else BLEU,
                                    spaceBefore=1, spaceAfter=8))
        elif kind == "h3":
            story.append(Paragraph(item[1], ST["h3"]))
        elif kind == "p":
            story.append(Paragraph(fmt(item[1]), ST["body"]))
        elif kind == "small":
            story.append(Paragraph(fmt(item[1]), ST["small"]))
        elif kind == "ul":
            for it in item[1]:
                story.append(Paragraph(
                    '<font color="#2563eb">●</font>&nbsp;&nbsp;%s' % fmt(it),
                    ST["body"]))
            story.append(Spacer(1, 3))
        elif kind == "ol":
            story.extend(steps(item[1], BLEU))
            story.append(Spacer(1, 4))
        elif kind == "formule":
            t = Table([[Paragraph(fmt(item[1]), ST["form"])]], colWidths=[None])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BLEU_CLAIR),
                ("LINEBEFORE", (0, 0), (0, -1), 4, BLEU),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))
        elif kind == "formule_o":
            t = Table([[Paragraph(fmt(item[1]), ST["form_o"])]], colWidths=[None])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), ORANGE_CLAIR),
                ("LINEBEFORE", (0, 0), (0, -1), 4, ORANGE),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))
        elif kind == "astuce":
            story.append(box([Paragraph(item[1], ST["boxtext_b"])], JAUNE_CLAIR, JAUNE))
            story.append(Spacer(1, 7))
        elif kind == "piege":
            story.append(box([Paragraph(item[1], ST["boxtext"])], ROUGE_CLAIR, ROUGE))
            story.append(Spacer(1, 7))
        elif kind == "reussite":
            story.append(box([Paragraph(item[1], ST["boxtext_r"])], VERT_CLAIR, VERT))
            story.append(Spacer(1, 7))
        elif kind == "exemple":
            titre, items, res = item[1], item[2], item[3]
            contenu = [Paragraph("Exemple — %s" % titre, ST["boxtitre"])]
            contenu.extend(steps(items, BLEU))
            if res:
                contenu.append(Spacer(1, 2))
                contenu.append(Paragraph("<b>%s</b>" % fmt(res), ST["boxtext_r"]))
            story.append(box(contenu, GRIS_CLAIR, BLEU))
            story.append(Spacer(1, 8))
        elif kind == "table":
            rows = item[1]
            data = []
            for i, row in enumerate(rows):
                data.append([Paragraph(fmt(c), ST["cell_h" if i == 0 else "cell_c"])
                             for c in row])
            t = Table(data, colWidths=[None] * len(rows[0]))
            t.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#dbe2ea")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(t)
            story.append(Spacer(1, 8))
        elif kind == "memo":
            lignes = [Paragraph("<b>%s</b>" % fmt(l) if False else fmt(l), ST["memo"])
                      for l in item[1]]
            t = Table([[l] for l in lignes], colWidths=[None])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BLEU_FONCE),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#4b6cb0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ]))
            story.append(t)
            story.append(Spacer(1, 10))
        elif kind == "exo":
            story.append(exo(*item[1:]))
        elif kind == "figure":
            story.append(Figure(item[1], item[2], item[3]))
            story.append(Spacer(1, 9))
        elif kind == "flow":
            story.append(item[1])
            story.append(Spacer(1, 5))
        elif kind == "space":
            story.append(Spacer(1, item[1]))
        elif kind == "pagebreak":
            from reportlab.platypus import PageBreak
            story.append(PageBreak())
        else:
            raise ValueError("type inconnu : %s" % kind)


# ---------------------------------------------------------------- document
def build(path, titre, sous_titre, contenu):
    doc = BaseDocTemplate(
        path, pagesize=A4,
        leftMargin=1.7 * cm, rightMargin=1.7 * cm,
        topMargin=1.5 * cm, bottomMargin=1.4 * cm,
        title=titre, author="Fiche de révision 5e", subject=sous_titre,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")

    def footer(canv, d):
        canv.saveState()
        canv.setFont("DJ", 7.5)
        canv.setFillColor(colors.HexColor("#94a3b8"))
        canv.drawString(doc.leftMargin, 0.9 * cm, titre)
        canv.drawRightString(doc.leftMargin + doc.width, 0.9 * cm,
                             "page %d" % canv.getPageNumber())
        canv.setStrokeColor(colors.HexColor("#dbe2ea"))
        canv.line(doc.leftMargin, 1.15 * cm, doc.leftMargin + doc.width, 1.15 * cm)
        canv.restoreState()

    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=footer)])
    story = []
    render(story, contenu)
    doc.build(story)
    print("écrit :", path)


# ================================================================ CONTENU
def contenu_fiche():
    c = [
        ("h1", "Réviser les maths pour demain",
         "Les aires et les pourcentages — niveau 5ème"),

        ("h2", "Mon plan de révision (1 heure et c'est bon)", BLEU),
        ("p", "Tu as jusqu'à demain : pas besoin de stresser. Fais ça dans l'ordre, tranquillement."),
        ("ol", [
            "<b>20 min — je lis la fiche des aires</b> en entier, sans chercher à tout retenir.",
            "<b>15 min — je cache et je refais les exemples</b> au brouillon, sans regarder la correction. C'est là que ça rentre vraiment.",
            "<b>10 min — même travail avec les pourcentages</b> : je lis, puis je refais les exemples seul.",
            "<b>10 min — je fais les exercices d'entraînement</b> (autre document) et je me corrige.",
            "<b>Demain matin — je relis le bloc « À retenir par cœur »</b> (5 minutes, à la fin de cette fiche).",
        ]),
        ("astuce", "<b>Le secret :</b> ne relis pas passivement ! Ferme les yeux et essaie de réciter « carré : côté × côté, rectangle : longueur × largeur, triangle : base × hauteur ÷ 2, disque : π × r × r ». Si tu y arrives sans regarder, c'est gagné."),

        ("h2", "1. Les aires", BLEU),
        ("h3", "C'est quoi une aire ?"),
        ("p", "L'<b>aire</b>, c'est la <b>surface</b> d'une figure : la place que ça prend « à l'intérieur ». C'est comme la <b>pelouse</b> d'un jardin : la quantité d'herbe qu'on pourrait y mettre."),
        ("piege", "<b>Ne confonds pas :</b> <b>périmètre</b> = le <b>tour</b> de la figure (la clôture du jardin) ; <b>aire</b> = l'<b>intérieur</b> (la pelouse). Le périmètre se mesure en cm (une longueur), l'aire en cm² (une surface) !"),

        ("h3", "Les unités d'aire"),
        ("p", "Une aire se mesure en <b>unités carrées</b> : mm², cm², dm², m²... Pour passer d'une unité à l'autre, on multiplie ou on divise par <b>100</b> (et pas par 10 !)."),
        ("table", [
            ["1 m² =", "100 dm²", "10 000 cm²"],
            ["1 km² =", "1 000 000 m²", "(1 km × 1 km)"],
        ]),
        ("astuce", "<b>Astuce du tableau :</b> dans un tableau de conversion d'aires, chaque colonne contient <b>2 chiffres</b> (contre 1 seul pour les longueurs). Exemple : `3,5 m² = 350 dm² = 35 000 cm²`. Bonus : 1 hm² s'appelle un <b>hectare</b> (1 ha = 10 000 m²)."),

        ("h3", "Les 4 formules à savoir (le plus important du contrôle)"),
        ("formule", "Carré : A = côté × côté"),
        ("formule", "Rectangle : A = Longueur × largeur"),
        ("formule", "Triangle : A = (base × hauteur) ÷ 2"),
        ("formule", "Disque : A = π × r × r   (avec π ≈ 3,14)"),
        ("astuce", "<b>Le triangle en 2 mots :</b> un triangle, c'est <b>la moitié</b> d'un rectangle ! Donc on calcule comme un rectangle (base × hauteur) et on <b>divise par 2</b>."),
        ("piege", "<b>Erreurs qui coûtent cher :</b><br/>"
                  "● <b>Oublier ÷ 2</b> pour le triangle. C'est LA faute classique du contrôle !<br/>"
                  "● <b>Confondre rayon et diamètre</b> : diamètre = 2 × rayon. Si l'énoncé donne 12 cm de diamètre, le rayon est 6 cm.<br/>"
                  "● <b>Confondre périmètre et aire</b> : « entourer, clôturer, grillager » → périmètre ; « couvrir, peindre, gazon, carrelage » → aire.<br/>"
                  "● <b>Oublier l'unité au carré</b> : on écrit cm², m²... jamais « cm » tout court."),

        ("h3", "Exemples corrigés (entraîne-toi à les refaire !)"),
        ("exemple", "Un rectangle",
         ["Formule : `A = L × l`", "Je remplace : `A = 12 × 7`", "Je calcule : `A = 84`"],
         "Un jardin rectangulaire de 12 m sur 7 m a une aire de 84 m²."),
        ("exemple", "Un triangle (attention au ÷ 2)",
         ["Formule : `A = (base × hauteur) ÷ 2`", "Je remplace : `A = (8 × 5) ÷ 2`",
          "Je calcule : `A = 40 ÷ 2 = 20`"],
         "Un triangle de base 8 cm et de hauteur 5 cm a une aire de 20 cm²."),
        ("exemple", "Un disque",
         ["Formule : `A = π × r × r`", "Je remplace : `A = 3,14 × 5 × 5`",
          "Je calcule : `A = 3,14 × 25 = 78,5`"],
         "Un disque de rayon 5 cm a une aire de 78,5 cm²."),

        ("h3", "Bonus : une figure compliquée (figure composée)"),
        ("p", "Parfois la figure n'est ni un carré ni un rectangle... Il faut la <b>découper</b> en morceaux simples : <b>je découpe, je calcule, j'additionne.</b>"),
        ("exemple", "Une forme en L (grand rectangle de 14 × 4, plus petit rectangle de 4 × 6)",
         ["Je découpe la figure en deux rectangles ① et ②.",
          "Aire de ① : `14 × 4 = 56 cm²`", "Aire de ② : `4 × 6 = 24 cm²`",
          "J'additionne : `56 + 24 = 80`"],
         "Aire totale = 80 cm²"),

        ("h2", "2. Les pourcentages", ORANGE),
        ("h3", "C'est quoi un pourcentage ?"),
        ("p", "« Pour cent », ça veut dire « <b>sur 100</b> ». Un pourcentage est donc une fraction sur 100."),
        ("formule_o", "25 % = 25 sur 100 = 25/100 = 0,25"),
        ("p", "Dire « 25 % des élèves aiment les maths », c'est dire : si on avait 100 élèves, 25 les aimeraient."),

        ("h3", "Les pourcentages à connaître par cœur"),
        ("table", [
            ["Pourcentage", "Fraction", "Comment calculer"],
            ["50 %", "1/2", "je divise par 2"],
            ["25 %", "1/4", "je divise par 4"],
            ["75 %", "3/4", "je divise par 4 puis × 3"],
            ["10 %", "1/10", "je divise par 10 (la virgule recule d'un cran)"],
            ["20 %", "1/5", "je divise par 5"],
            ["100 %", "1", "le tout : le nombre ne change pas"],
            ["200 %", "2", "le double : je multiplie par 2"],
        ]),
        ("astuce", "<b>Astuce du 10 % :</b> 10 % de 45 € = 4,50 € — tu décales juste la virgule d'un cran. Et 5 % ? C'est la moitié de 10 % ! (10 % de 60 = 6, donc 5 % de 60 = 3.)"),

        ("h3", "Calculer un pourcentage d'un nombre (le calcul le plus fréquent)"),
        ("formule_o", "t % d'un nombre = (nombre ÷ 100) × t"),
        ("p", "Autre ordre possible : `(nombre × t) ÷ 100`. Les deux donnent le même résultat — choisis celui que tu retiens le mieux."),
        ("exemple", "15 % de 60 kg",
         ["Je divise par 100 : `60 ÷ 100 = 0,6` (ça, c'est 1 % de 60 kg)",
          "Je multiplie par 15 : `0,6 × 15 = 9`"],
         "15 % de 60 kg = 9 kg"),
        ("exemple", "30 % de 250 €",
         ["Je divise par 100 : `250 ÷ 100 = 2,5`", "Je multiplie par 30 : `2,5 × 30 = 75`"],
         "30 % de 250 € = 75 €"),

        ("h3", "Calculer un pourcentage (dans l'autre sens)"),
        ("formule_o", "Je fais (partie ÷ total) × 100"),
        ("exemple", "Une note de 17 sur 20",
         ["`17 ÷ 20 = 0,85`", "`0,85 × 100 = 85`"],
         "17/20 = 85 %"),

        ("h3", "Bonus : les soldes et les augmentations"),
        ("p", "La méthode est toujours la même, en 2 temps."),
        ("exemple", "Un pull à 40 € soldé à − 25 %",
         ["Je calcule la réduction : `25 % de 40 = (40 ÷ 100) × 25 = 0,4 × 25 = 10 €`",
          "Je soustrais du prix de départ : `40 − 10 = 30`"],
         "Le pull coûte 30 €"),
        ("p", "Pour une <b>augmentation</b>, c'est pareil mais on <b>ajoute</b> au lieu de soustraire : un prix de 50 € qui augmente de 10 % donne 50 + 5 = 55 €."),
        ("piege", "<b>Erreurs qui coûtent cher :</b><br/>"
                  "● <b>Oublier de diviser par 100</b> : « 20 % de 50 » ce n'est pas `20 × 50`, c'est `(50 ÷ 100) × 20 = 10`.<br/>"
                  "● <b>Pour une réduction, oublier de soustraire</b> : si on demande le prix final, calculer la réduction ne suffit pas.<br/>"
                  "● <b>Répondre sans unité</b> : 9 kg, 75 €, 85 %... toujours l'unité !<br/>"
                  "● <b>Confondre « t % de » et « t % en plus »</b> : 20 % de 50 = 10, mais 50 augmenté de 20 % = 60."),

        ("h2", "À retenir par cœur (relis ça demain matin)", BLEU),
        ("memo", [
            "★ Aire = l'intérieur  •  Périmètre = le tour  •  l'aire s'écrit toujours en unité <b>au carré</b> (cm², m²...)",
            "★ Carré : A = côté × côté",
            "★ Rectangle : A = Longueur × largeur",
            "★ Triangle : A = (base × hauteur) ÷ 2   ← le ÷ 2, on n'oublie pas !",
            "★ Disque : A = π × r × r avec π ≈ 3,14   •   le rayon = la moitié du diamètre",
            "★ Pourcentage : t % d'un nombre = (nombre ÷ 100) × t",
            "★ Repères : 50 % = la moitié  •  25 % = le quart  •  10 % = je recule la virgule  •  100 % = le tout",
            "★ Pourcentage inverse : (partie ÷ total) × 100   →   exemple : 17/20 = 85 %",
            "★ Solde : je calcule la réduction, <b>puis je la soustrais</b> du prix de départ",
        ]),
    ]
    return c


def contenu_exercices():
    NIV = [
        ("h2", "Niveau 1 — Guidé : les aires", BLEU),
        ("small", "La formule est rappelée avant chaque exercice : tu n'as plus qu'à l'appliquer. Exercices 1 à 7."),
        ("exo", "1", "L'aire d'un carré", "A = côté × côté.",
         "Un carré a un côté de 7 cm. Calcule son aire.",
         ["Formule : `A = côté × côté`", "Je remplace : `A = 7 × 7`", "Je calcule : `A = 49`"],
         "Aire = 49 cm²"),
        ("exo", "2", "L'aire d'un rectangle", "A = Longueur × largeur.",
         "Un rectangle mesure 8 m de long et 5 m de large. Calcule son aire.",
         ["Formule : `A = L × l`", "Je remplace : `A = 8 × 5`", "Je calcule : `A = 40`"],
         "Aire = 40 m²"),
        ("exo", "3", "L'aire d'un triangle", "A = (base × hauteur) ÷ 2.",
         "Un triangle a une base de 12 cm et une hauteur de 5 cm. Calcule son aire.",
         ["Formule : `A = (base × hauteur) ÷ 2`", "Je remplace : `A = (12 × 5) ÷ 2`",
          "Je calcule : `A = 60 ÷ 2`", "`A = 30`"],
         "Aire = 30 cm²  (un triangle, c'est la moitié d'un rectangle de 12 × 5 = 60 cm²)"),
        ("exo", "4", "L'aire d'un disque", "A = π × r × r avec π ≈ 3,14.",
         "Un disque a un rayon de 4 cm. Calcule son aire (π ≈ 3,14).",
         ["Formule : `A = π × r × r`", "Je remplace : `A = 3,14 × 4 × 4`",
          "Je calcule : `A = 3,14 × 16`", "`A = 50,24`"],
         "Aire = 50,24 cm²"),
        ("exo", "5", "Trouver une longueur d'abord", "Périmètre du carré : P = côté × 4  |  Aire : A = côté × côté.",
         "Un carré a un périmètre de 20 cm. Calcule son aire.",
         ["Je cherche d'abord le côté : `côté = 20 ÷ 4 = 5 cm`",
          "Maintenant j'applique la formule de l'aire : `A = 5 × 5`",
          "`A = 25`"],
         "Aire = 25 cm²  (parfois il faut d'abord trouver une longueur)"),
        ("exo", "6", "Encore un triangle", "A = (base × hauteur) ÷ 2.",
         "Un triangle a une base de 9 cm et une hauteur de 6 cm. Calcule son aire.",
         ["`A = (9 × 6) ÷ 2`", "`A = 54 ÷ 2`", "`A = 27`"],
         "Aire = 27 cm²"),
        ("exo", "7", "Lequel est le plus grand ?", "Carré : A = côté × côté  |  Rectangle : A = L × l.",
         "Jeanne a deux gâteaux : un carré de 6 cm de côté et un rectangle de 9 cm sur 4 cm. Quel gâteau a la plus grande surface ?",
         ["Aire du carré : `6 × 6 = 36 cm²`", "Aire du rectangle : `9 × 4 = 36 cm²`",
          "Je compare : `36 = 36`"],
         "Ils ont exactement la même aire : 36 cm² ! (des figures différentes peuvent avoir la même aire)"),

        ("h2", "Niveau 2 — Tout seul : les aires", VIOLET),
        ("small", "Plus de rappel : c'est à toi de choisir la bonne formule. Exercices 8 à 14."),
        ("exo", "8", "Rectangle", None,
         "Une feuille mesure 15 cm sur 4 cm. Calcule son aire.",
         ["`A = L × l = 15 × 4`", "`A = 60`"],
         "Aire = 60 cm²"),
        ("exo", "9", "Piège : diamètre ou rayon ?", None,
         "Un disque a un diamètre de 10 cm. Calcule son aire (π ≈ 3,14).",
         ["Je trouve d'abord le rayon : `r = 10 ÷ 2 = 5 cm`",
          "Formule : `A = 3,14 × 5 × 5`", "`A = 3,14 × 25`", "`A = 78,5`"],
         "Aire = 78,5 cm²  (la faute classique : faire 3,14 × 10 × 10 = 314, c'est faux !)"),
        ("exo", "10", "Carré avec des décimaux", None,
         "Un carré de moquette a un côté de 2,5 m. Calcule son aire.",
         ["`A = 2,5 × 2,5`", "`A = 6,25`"],
         "Aire = 6,25 m²  (astuce : 2,5 = 25 ÷ 10, donc (25 × 25) ÷ 100 = 625 ÷ 100)"),
        ("exo", "11", "Triangle", None,
         "Un triangle a une base de 7 m et une hauteur de 4 m. Calcule son aire.",
         ["`A = (7 × 4) ÷ 2`", "`A = 28 ÷ 2 = 14`"],
         "Aire = 14 m²"),
        ("exo", "12", "Figure composée (forme en L)", None,
         "Cette figure est formée d'un rectangle de 10 cm sur 3 cm et d'un carré de 3 cm de côté collé dessous. Calcule l'aire totale.",
         ["Aire ① (rectangle) : `10 × 3 = 30 cm²`", "Aire ② (carré) : `3 × 3 = 9 cm²`",
          "J'additionne les deux morceaux : `30 + 9 = 39`"],
         "Aire totale = 39 cm²  (méthode : je découpe, je calcule, j'additionne)"),
        ("exo", "13", "Problème de gazon", None,
         "Un jardin rectangulaire mesure 25 m de long et 12 m de large. On veut le recouvrir entièrement de gazon. Quelle surface de gazon faut-il acheter ?",
         ["`A = 25 × 12`", "`A = 300`"],
         "Il faut 300 m² de gazon  (attention : « recouvrir » = aire, « clôturer » = périmètre)"),
        ("exo", "14", "Le carrelage", None,
         "Un carreau de carrelage est un carré de 30 cm de côté. Calcule l'aire d'un carreau.",
         ["`A = 30 × 30`", "`A = 900`"],
         "Aire d'un carreau = 900 cm²"),

        ("h2", "Niveau 3 — Guidé : les pourcentages", ORANGE),
        ("small", "La méthode est rappelée, et on commence par des astuces qui évitent presque tous les calculs. Exercices 15 à 20."),
        ("exo", "15", "L'astuce des 10 %", "10 % d'un nombre = je recule la virgule d'un cran.",
         "Combien font 10 % de 80 ?",
         ["Méthode rapide : `80 ÷ 10 = 8`",
          "Vérification avec la formule : `(80 ÷ 100) × 10 = 0,8 × 10 = 8`"],
         "10 % de 80 = 8"),
        ("exo", "16", "L'astuce des 50 %", "50 % d'un nombre = je divise par 2 (c'est la moitié).",
         "Combien font 50 % de 46 ?",
         ["`46 ÷ 2 = 23`"],
         "50 % de 46 = 23"),
        ("exo", "17", "L'astuce des 25 %", "25 % d'un nombre = je divise par 4 (c'est le quart).",
         "Combien font 25 % de 60 ?",
         ["`60 ÷ 4 = 15`",
          "Ou en deux fois : `60 ÷ 2 = 30` puis `30 ÷ 2 = 15`"],
         "25 % de 60 = 15"),
        ("exo", "18", "La méthode complète", "t % d'un nombre = (nombre ÷ 100) × t.",
         "Combien font 20 % de 150 ?",
         ["`150 ÷ 100 = 1,5`", "`1,5 × 20 = 30`",
          "Autre façon : 10 % de 150 = 15, donc 20 % = 15 × 2 = 30"],
         "20 % de 150 = 30"),
        ("exo", "19", "30 %", "t % d'un nombre = (nombre ÷ 100) × t.",
         "Combien font 30 % de 90 ?",
         ["10 % de 90 : `90 ÷ 10 = 9`", "30 %, c'est 3 fois 10 % : `9 × 3 = 27`",
          "Vérification : `(90 ÷ 100) × 30 = 0,9 × 30 = 27`"],
         "30 % de 90 = 27"),
        ("exo", "20", "60 %", "t % d'un nombre = (nombre ÷ 100) × t.",
         "Combien font 60 % de 45 ?",
         ["Méthode 1 : `45 ÷ 100 = 0,45` puis `0,45 × 60 = 27`",
          "Méthode 2 : `45 × 60 = 2700` puis `2700 ÷ 100 = 27`"],
         "60 % de 45 = 27  (les deux méthodes marchent : garde celle où tu te trompes le moins)"),

        ("h2", "Niveau 4 — Tout seul : les pourcentages", JAUNE),
        ("small", "Sans rappel de méthode, comme au contrôle. Exercices 21 à 28."),
        ("exo", "21", "10 % en euros", None,
         "Combien font 10 % de 250 € ?",
         ["`250 ÷ 10 = 25`"],
         "10 % de 250 € = 25 €"),
        ("exo", "22", "75 %", None,
         "Combien font 75 % de 40 ?",
         ["Le quart : `40 ÷ 4 = 10`", "Les trois quarts : `10 × 3 = 30`",
          "Vérification : `(40 ÷ 100) × 75 = 0,4 × 75 = 30`"],
         "75 % de 40 = 30"),
        ("exo", "23", "Un pourcentage qui n'est pas « rond »", None,
         "Combien font 12 % de 150 ?",
         ["Méthode directe : `150 ÷ 100 = 1,5` puis `1,5 × 12 = 18`",
          "Autre méthode (décomposer) : 10 % = 15 et 2 % = 3, donc `15 + 3 = 18`"],
         "12 % de 150 = 18"),
        ("exo", "24", "Les soldes", None,
         "Un pull coûte 80 €. Il est soldé à − 25 %. Quel est son nouveau prix ?",
         ["Réduction : `25 % de 80 = 80 ÷ 4 = 20 €`", "Nouveau prix : `80 − 20 = 60 €`"],
         "Le pull coûte maintenant 60 €  (attention : 20 €, c'est la réduction, pas le prix final !)"),
        ("exo", "25", "Une augmentation", None,
         "Un billet de concert coûte 60 €. Le prix augmente de 10 %. Quel est le nouveau prix ?",
         ["Augmentation : `10 % de 60 = 6 €`", "Nouveau prix : `60 + 6 = 66 €`"],
         "Le billet coûte maintenant 66 €"),
        ("exo", "26", "Dans l'autre sens : une note en %", None,
         "Léa a eu 18 sur 20 à un devoir. Quel pourcentage de réussite ça représente ?",
         ["`18 ÷ 20 = 0,9`", "`0,9 × 100 = 90`"],
         "18/20 = 90 %  (raccourci : sur 20, je multiplie la note par 5)"),
        ("exo", "27", "Problème de classe", None,
         "Dans une classe de 30 élèves, 40 % sont des filles. a) Combien y a-t-il de filles ? b) Combien y a-t-il de garçons ?",
         ["a) Filles : `(30 ÷ 100) × 40 = 0,3 × 40 = 12`",
          "b) Garçons : `30 − 12 = 18`",
          "Vérification : `12 + 18 = 30` et 12/30 = 40 %"],
         "12 filles et 18 garçons"),
        ("exo", "28", "Taux de réussite", None,
         "Sur 60 élèves qui passent un examen, 45 sont reçus. Quel est le pourcentage de réussite ?",
         ["`45 ÷ 60 = 0,75`", "`0,75 × 100 = 75`",
          "Vérification : 75 %, c'est les trois quarts, et 3/4 de 60 = 45"],
         "75 % d'élèves reçus"),

        ("h2", "Niveau 5 — Contrôle blanc (noté sur 20)", ROUGE),
        ("small", "Mets-toi dans les conditions du contrôle : 25 minutes, une feuille, pas de correction ouverte. Les 6 exercices valent 20 points au total."),
        ("exo", "29", "Le terrain  (4 pts)", None,
         "Un terrain rectangulaire mesure 35 m de long et 18 m de large. a) Calcule son aire en m². b) Convertis cette aire en dm².",
         ["a) `A = 35 × 18`", "`A = 630` → 630 m²",
          "b) Pour passer des m² aux dm², on multiplie par 100 :",
          "`630 × 100 = 63 000`"],
         "a) 630 m²  •  b) 63 000 dm²"),
        ("exo", "30", "Le triangle  (3 pts)", None,
         "Un triangle a une base de 14 cm et une hauteur de 9 cm. Calcule son aire.",
         ["`A = (14 × 9) ÷ 2`", "`A = 126 ÷ 2 = 63`"],
         "Aire = 63 cm²  (as-tu pensé au ÷ 2 ? Sinon c'est 126 cm² et c'est faux)"),
        ("exo", "31", "Le disque  (3 pts)", None,
         "Un disque a un rayon de 6 cm. Calcule son aire (π ≈ 3,14).",
         ["`A = 3,14 × 6 × 6`", "`A = 3,14 × 36`", "`A = 113,04`"],
         "Aire = 113,04 cm²"),
        ("exo", "32", "Le pourcentage  (3 pts)", None,
         "Calcule 35 % de 240 €.",
         ["`240 ÷ 100 = 2,4`", "`2,4 × 35 = 84`"],
         "35 % de 240 € = 84 €"),
        ("exo", "33", "Les soldes  (4 pts)", None,
         "Une veste coûte 150 €. Le magasin fait − 20 % sur tout. Quel est le nouveau prix de la veste ?",
         ["Réduction : `20 % de 150 = 1,5 × 20 = 30 €`", "Nouveau prix : `150 − 30 = 120 €`"],
         "La veste coûte 120 €  (si tu as répondu 30 €, tu as oublié de soustraire)"),
        ("exo", "34", "Le taux de réussite  (3 pts)", None,
         "Un élève a eu 20 bonnes réponses sur 25 questions. Quel pourcentage de bonnes réponses a-t-il eu ?",
         ["`20 ÷ 25 = 0,8`", "`0,8 × 100 = 80`",
          "Astuce : 20/25 = 80/100 (on multiplie en haut et en bas par 4)"],
         "80 % de bonnes réponses"),

        ("reussite", "<b>Barème :</b> 17 à 20 → excellent, tu es prêt(e) pour demain. 13 à 16 → bien, refais les exercices ratés. 9 à 12 → relis les formules et refais les niveaux 1 et 3. Moins de 9 → concentre-toi sur le bloc « À retenir par cœur » de la fiche, puis refais ce contrôle blanc."),

        ("h2", "Tout ce qu'il faut avoir en tête", BLEU),
        ("table", [
            ["Ce que je cherche", "Ce que je fais"],
            ["Aire d'un carré", "côté × côté"],
            ["Aire d'un rectangle", "Longueur × largeur"],
            ["Aire d'un triangle", "(base × hauteur) ÷ 2"],
            ["Aire d'un disque", "π × r × r   (π ≈ 3,14)"],
            ["Je connais le diamètre", "je divise par 2 pour avoir le rayon"],
            ["Figure compliquée", "je découpe, je calcule, j'additionne"],
            ["t % d'un nombre", "(nombre ÷ 100) × t"],
            ["10 % / 25 % / 50 %", "÷ 10  /  ÷ 4  /  ÷ 2"],
            ["Je cherche le pourcentage", "(partie ÷ total) × 100"],
            ["Soldes", "je calcule la réduction, puis je la soustrais"],
            ["Augmentation", "je calcule l'augmentation, puis je l'ajoute"],
        ]),
        ("astuce", "<b>Le soir des devoirs :</b> ne relis pas, <b>refais</b>. Prends une feuille blanche et réécris les 5 formules de mémoire. Ce que tu écris de tête, tu le retiens 10 fois mieux que ce que tu relis."),
    ]
    return NIV


def contenu_formules():
    """Fiche « apprendre les formules » : d'où elles viennent + comment les retenir."""
    C = []
    C += [
        ("h1", "Apprendre les formules (sans les apprendre bêtement)",
         "Pourquoi les formules sont comme ça — et comment les retenir"),
        ("p", "Une formule qu'on <b>comprend</b>, on la retient 10 fois mieux qu'une formule "
              "qu'on récite sans savoir d'où elle sort. Cette fiche explique <b>comment on les fabrique</b>, "
              "puis donne une méthode pour les mettre dans ta tête."),

        ("h2", "1. D'où vient la formule du rectangle ? (la plus importante)", BLEU),
        ("p", "Prends un rectangle de 4 cm sur 3 cm. On le remplit avec des petits carrés de "
              "1 cm de côté : chacun a une aire de <b>1 cm²</b>."),
        ("figure", 498, 150, d_rectangle_grille),
        ("p", "On compte : <b>4 carrés par rangée</b> et <b>3 rangées</b>, donc "
              "`4 × 3 = 12` carrés, donc <b>12 cm²</b>. C'est exactement ça une aire : "
              "le <b>nombre de petits carrés de 1 cm²</b> qui remplissent la figure."),
        ("formule", "Aire du rectangle :  A = Longueur × largeur"),
        ("astuce", "<b>L'image à garder dans la tête :</b> « des rangées de petits carrés ». "
                   "Largeur = combien il y a de carrés sur une rangée. Longueur... peu importe l'ordre : "
                   "on multiplie les deux, c'est tout."),

        ("h2", "2. Et le carré ? C'est un rectangle particulier", BLEU),
        ("figure", 498, 130, d_carre),
        ("p", "Dans un carré, la longueur et la largeur sont <b>égales</b> : les deux valent le côté. "
              "Donc dans la formule `L × l`, on écrit `c × c`."),
        ("formule", "Aire du carré :  A = côté × côté"),
        ("astuce", "<b>Tu n'as pas deux formules à retenir !</b> Si tu connais celle du rectangle, "
                   "celle du carré vient toute seule."),

        ("h2", "3. Pourquoi le triangle, c'est « ÷ 2 » ?", BLEU),
        ("p", "C'est LA formule que tout le monde oublie. Alors comprends-la une fois pour toutes :"),
        ("figure", 498, 165, d_triangle),
        ("ol", [
            "Je prends <b>deux triangles identiques</b>.",
            "Je tourne le deuxième et je le colle au premier sur le côté penché.",
            "J'obtiens un <b>parallélogramme</b>, et ce parallélogramme a la même aire "
            "qu'un rectangle de base × hauteur.",
            "Un seul triangle, c'est donc <b>la moitié</b> : `(base × hauteur) ÷ 2`.",
        ]),
        ("formule", "Aire du triangle :  A = (base × hauteur) ÷ 2"),
        ("piege", "<b>Le piège du contrôle :</b> si tu trouves un nombre <b>rond et trop grand</b>, "
                  "c'est sûrement que tu as oublié le ÷ 2. Exemple : base 14 et hauteur 9 → "
                  "`14 × 9 = 126` … et la bonne réponse est `126 ÷ 2 = 63 cm²`."),

        ("h2", "4. Le disque : celle-là, on l'apprend par cœur", BLEU),
        ("figure", 498, 150, d_disque),
        ("p", "Un disque a un bord <b>rond</b> : on ne peut pas le remplir parfaitement avec des petits carrés, "
              "le compte ne tombe jamais juste. C'est pour ça que la formule fait intervenir "
              "un nombre bizarre, <b>π</b> (on dit « pi »), qui vaut toujours environ <b>3,14</b>."),
        ("formule", "Aire du disque :  A = π × r × r     (π ≈ 3,14)"),
        ("astuce", "<b>Le rythme à retenir :</b> « pi - rayon - rayon ». Dis-le trois fois à voix haute, "
                   "ça rentre tout seul. Et <b>r</b>, c'est le <b>rayon</b>, la moitié du diamètre : "
                   "si l'énoncé donne le diamètre, tu divises par 2 <b>avant</b> de calculer."),

        ("h2", "5. Les pourcentages : tout vient du mot « cent »", ORANGE),
        ("p", "« Pour <b>cent</b> », ça veut dire « sur <b>100</b> ». Donc 25 %, c'est 25 cases sur 100 :"),
        ("figure", 498, 150, d_pourcent),
        ("p", "Maintenant le point clé : en maths, le petit mot <b>« de »</b> veut dire <b>« × »</b>. "
              "« 25 % <b>de</b> 60 », c'est donc « 25 % <b>×</b> 60 », soit :"),
        ("formule_o", "t % d'un nombre = (t ÷ 100) × nombre"),
        ("p", "On peut réécrire la même chose dans l'autre ordre, ce qui est plus facile à calculer :"),
        ("formule_o", "t % d'un nombre = (nombre ÷ 100) × t"),
        ("exemple", "Les deux écritures donnent la même chose",
         ["Avec la première : `(25 ÷ 100) × 60 = 0,25 × 60 = 15`",
          "Avec la seconde : `(60 ÷ 100) × 25 = 0,6 × 25 = 15`"],
         "Les deux donnent 15. Choisis celle que tu préfères et garde-la toujours."),
        ("astuce", "<b>Les raccourcis qui évitent de calculer :</b> 50 % = je divise par 2 • "
                   "25 % = je divise par 4 • 10 % = je recule la virgule d'un cran • "
                   "100 % = le nombre entier."),
        ("pagebreak",),
    ]

    C += [
        ("h2", "6. Ma méthode pour les retenir : la règle du 3 - 2 - 1", VERT),
        ("p", "Pour chaque formule, tu fais exactement ça. Ça prend 2 minutes par formule, "
              "soit 10 minutes pour tout :"),
        ("ol", [
            "<b>3 fois : je la lis</b> à voix haute, lentement. À voix haute, pas dans ma tête !",
            "<b>2 fois : je l'écris</b> sur une feuille, sans regarder le modèle.",
            "<b>1 fois : je la récite</b> de mémoire, les yeux fermés, puis je vérifie si c'était juste.",
        ]),
        ("astuce", "<b>Pourquoi ça marche :</b> ton cerveau retient ce qu'il <b>fabrique</b>, pas ce qu'il "
                   "<b>relit</b>. Écrire et réciter, c'est se forcer à se souvenir — et c'est exactement "
                   "ce qu'on te demandera au contrôle."),
        ("h3", "Le petit chant des formules (à répéter à voix haute)"),
        ("memo", [
            "★ Carré : côté fois côté !",
            "★ Rectangle : longueur fois largeur !",
            "★ Triangle : base fois hauteur, divisé par deux !",
            "★ Disque : pi fois rayon fois rayon !",
            "★ Pour cent : sur cent, et je multiplie !",
        ]),
        ("p", "Dis-le sur un rythme, comme une comptine. Bizarre, mais ça marche vraiment."),

        ("h2", "7. À toi : je remplis les trous", VERT),
        ("small", "Écris sur la ligne, sans regarder les fiches. Les réponses sont tout à la fin du document — "
                  "ne va les voir qu'une fois que tu as tout rempli !"),
        ("table", [
            ["N°", "À compléter"],
            ["1", "Aire du carré = …………… × ……………"],
            ["2", "Aire du rectangle = …………… × ……………"],
            ["3", "Aire du triangle = (…………… × ……………) ÷ ……………"],
            ["4", "Aire du disque = …………… × …………… × ……………"],
            ["5", "Le rayon, c'est la moitié du ………………………"],
            ["6", "1 m² = …………… dm²"],
            ["7", "t % d'un nombre = (nombre ÷ ……………) × ……………"],
            ["8", "50 % d'un nombre : je divise par ……………"],
            ["9", "25 % d'un nombre : je divise par ……………"],
            ["10", "10 % d'un nombre : je recule la …………… d'un cran"],
            ["11", "Aire d'un carré de 6 cm de côté = …………… cm²"],
            ["12", "Aire d'un triangle de base 10 cm et de hauteur 4 cm = …………… cm²"],
            ["13", "50 % de 84 = ……………"],
            ["14", "25 % de 40 = ……………"],
            ["15", "10 % de 350 = ……………"],
        ]),
        ("pagebreak",),

        ("h2", "8. Ma feuille à plier (pour réviser partout)", BLEU),
        ("p", "Imprime cette page, puis <b>plie-la en deux</b> sur la ligne du milieu : "
              "tu ne vois plus que les questions. Tu réponds de mémoire, puis tu déplies pour vérifier. "
              "Parfait pour réviser dans le bus ou avant de dormir."),
    ]

    lignes = [
        ("Aire du carré", "côté × côté"),
        ("Aire du rectangle", "Longueur × largeur"),
        ("Aire du triangle", "(base × hauteur) ÷ 2"),
        ("Aire du disque", "π × r × r   (π ≈ 3,14)"),
        ("Le rayon, c'est…", "la moitié du diamètre"),
        ("Figure compliquée", "je découpe, je calcule, j'additionne"),
        ("t % d'un nombre", "(nombre ÷ 100) × t"),
        ("50 %", "je divise par 2"),
        ("25 %", "je divise par 4"),
        ("10 %", "je recule la virgule"),
        ("Je cherche le pourcentage", "(partie ÷ total) × 100"),
        ("Soldes (− 20 %)", "je calcule la réduction, puis je la soustrais"),
        ("Augmentation", "je calcule l'augmentation, puis je l'ajoute"),
    ]
    data = [[Paragraph("<b>Je récite…</b>", ST["cell"]),
             Paragraph("<b>…la réponse est</b>", ST["cell"])]]
    for q, r in lignes:
        data.append([Paragraph(q, ST["cell"]), Paragraph(fmt(r), ST["cell"])])
    t = Table(data, colWidths=[None, None])
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#dbe2ea")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEAFTER", (0, 0), (0, -1), 1.2, colors.HexColor("#94a3b8")),
    ]))
    C.append(("flow", t))
    C.append(("small", "↑ La ligne du milieu est le pli. Plie pour ne voir que la colonne de gauche."))
    C.append(("pagebreak",))

    C += [
        ("h2", "Réponses (ne regarde qu'après avoir tout rempli !)", ROUGE),
        ("table", [
            ["N°", "Réponse"],
            ["1", "côté × côté"],
            ["2", "Longueur × largeur"],
            ["3", "(base × hauteur) ÷ 2"],
            ["4", "π × r × r"],
            ["5", "diamètre"],
            ["6", "100"],
            ["7", "… ÷ 100) × t"],
            ["8", "2"],
            ["9", "4"],
            ["10", "virgule"],
            ["11", "36 cm²   (6 × 6)"],
            ["12", "20 cm²   ((10 × 4) ÷ 2)"],
            ["13", "42   (84 ÷ 2)"],
            ["14", "10   (40 ÷ 4)"],
            ["15", "35   (je recule la virgule)"],
        ]),
        ("reussite", "<b>Si tu as 15/15</b> : les formules sont dans ta tête, tu peux passer aux exercices. "
                     "<b>Si tu as moins de 12</b> : refais les parties 1 à 5 de cette fiche en lisant bien les "
                     "dessins, puis recommence les trous. Tu vas y arriver !"),
        ("astuce", "<b>Le dernier conseil avant de dormir :</b> relis juste les 5 lignes du « petit chant » "
                   "et la liste « à retenir par cœur » de la fiche de révision. Ton cerveau range tout ça "
                   "pendant la nuit."),
    ]
    return C


def main():
    register_fonts()
    global ST
    ST = styles()

    ici = os.path.dirname(os.path.abspath(__file__))
    racine = os.path.dirname(ici)

    build(os.path.join(racine, "fiche-revision-maths-5e.pdf"),
          "Fiche de révision — Maths 5ème",
          "Aires et pourcentages",
          contenu_fiche())

    build(os.path.join(racine, "exercices-maths-5e.pdf"),
          "Entraînement — Maths 5ème (aires et pourcentages)",
          "34 exercices corrigés",
          contenu_exercices())

    build(os.path.join(racine, "apprendre-les-formules-5e.pdf"),
          "Apprendre les formules — Maths 5ème",
          "Aires et pourcentages : d'où viennent les formules",
          contenu_formules())


if __name__ == "__main__":
    main()
